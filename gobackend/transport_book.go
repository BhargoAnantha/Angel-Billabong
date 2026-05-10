package main

import (
	"fmt"
	"log"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

// ── Nomor WA Admin (untuk notifikasi internal) ────────────────────────────
// Ganti dengan nomor WA admin, format tanpa + (contoh: "628123456789")
const adminWANumber = "6281338134797"

type TransportBook struct {
	gorm.Model
	TransportBookName string    `json:"transport_book_name"`
	CustomerName      string    `json:"customer_name"`
	FirstName         string    `json:"first_name"`
	LastName          string    `json:"last_name"`
	Email             string    `json:"email"`
	DepartureDate     string    `json:"departure_date"`
	Whatsapp          string    `json:"whatsapp"`
	Payment           string    `json:"payment"`
	Status            string    `json:"status" gorm:"default:Pending"`
	TransportID       uint      `json:"transport_id"`
	Transport         Transport `gorm:"foreignKey:TransportID;references:ID"`

	TotalPrice  float64 `json:"total_price"`
	RouteName   string  `json:"route_name"`
	IsRoundTrip int     `json:"is_round_trip"`
	ReturnDate  string  `json:"return_date"`
	ReturnTime  string  `json:"return_time"`

	PassangerDetails  string `json:"passanger_details" gorm:"type:text"`
	PassangerGender   string `json:"passanger_gender"`
	PassangerFullName string `json:"passanger_full_name"`
	PassangerAge      string `json:"passanger_age"`
	PassangerNation   string `json:"passanger_nation"`
}

func (TransportBook) TableName() string {
	return "transport_books"
}

func Registertransport_bookRouter(r *gin.Engine) {
	api := r.Group("/api/v1")
	{
		api.GET("/transport_book", GetAlltransport_bookHandler)
		api.POST("/transport_book", Createtransport_bookHandler)
		api.PUT("/transport_book/:id", Updatetransport_bookHandler)
		api.PATCH("/transport_book/:id/status", UpdateStatusHandler)
		api.DELETE("/transport_book/:id", Deletetransport_bookHandler)

		// ── Endpoint baru: lookup reservasi untuk "My Reservation" ──────
		api.POST("/transport_book/lookup", LookupReservationHandler)
	}
}

// ── GET all ───────────────────────────────────────────────────────────────

func GetAlltransport_bookHandler(c *gin.Context) {
	var transport_book []TransportBook
	result := db.Preload("Transport").Order("id desc").Find(&transport_book)
	if result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error: " + result.Error.Error()})
		return
	}
	c.JSON(http.StatusOK, transport_book)
}

// ── CREATE ────────────────────────────────────────────────────────────────

func Createtransport_bookHandler(c *gin.Context) {
	var transport_book TransportBook

	if err := c.ShouldBindJSON(&transport_book); err != nil {
		fmt.Printf("BIND ERROR: %v\n", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": "Format data tidak valid", "details": err.Error()})
		return
	}

	if err := db.Model(&TransportBook{}).Create(&transport_book).Error; err != nil {
		fmt.Printf("DATABASE ERROR: %v\n", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal simpan ke database"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message": "booking created",
		"data":    transport_book,
	})
}

// ── UPDATE ────────────────────────────────────────────────────────────────

func Updatetransport_bookHandler(c *gin.Context) {
	idStr := c.Param("id")
	id, _ := strconv.Atoi(idStr)
	var transport_book TransportBook
	if err := db.First(&transport_book, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Booking tidak ditemukan"})
		return
	}
	if err := c.ShouldBindJSON(&transport_book); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	db.Save(&transport_book)
	c.JSON(http.StatusOK, gin.H{"message": "booking updated", "data": transport_book})
}

// ── UPDATE STATUS (dengan trigger email + WA) ─────────────────────────────

func UpdateStatusHandler(c *gin.Context) {
	id := c.Param("id")

	var input struct {
		PaymentStatus string `json:"payment_status"`
	}
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Format data salah"})
		return
	}

	// Update status di database
	if err := db.Model(&TransportBook{}).Where("id = ?", id).Update("status", input.PaymentStatus).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal update status"})
		return
	}

	// ── Hanya kirim notifikasi jika status berubah menjadi "Sukses" ───────
	if input.PaymentStatus == "Sukses" {
		// Ambil data booking lengkap beserta relasi Transport
		var booking TransportBook
		if err := db.Preload("Transport").First(&booking, id).Error; err != nil {
			// Status sudah terupdate, hanya log error notifikasi
			log.Printf("⚠️ Gagal ambil data booking untuk notifikasi (ID: %s): %v", id, err)
			c.JSON(http.StatusOK, gin.H{"message": "Status updated. Notifikasi gagal dikirim."})
			return
		}

		// Susun booking code (format: AB-001)
		bookingCode := fmt.Sprintf("AB-%03d", booking.ID)

		// Format harga
		totalPriceFormatted := formatIDR(booking.TotalPrice)

		// Ambil jam keberangkatan dari Transport
		departureTime := "07:30"
		if booking.Transport.ID != 0 {
			departureTime = booking.Transport.Time
		}

		// Data email
		emailData := EmailData{
			FirstName:     booking.FirstName,
			CustomerName:  booking.CustomerName,
			BookingCode:   bookingCode,
			RouteName:     booking.RouteName,
			DepartureDate: booking.DepartureDate,
			ReturnDate:    booking.ReturnDate,
			DepartureTime: departureTime,
			TotalPrice:    totalPriceFormatted,
			Payment:       booking.Payment,
			IsRoundTrip:   booking.IsRoundTrip == 1,
		}

		// ── 1. Kirim email ke user ─────────────────────────────────────
		if booking.Email != "" {
			go func() {
				if err := SendBookingConfirmationEmail(booking.Email, emailData); err != nil {
					log.Printf("⚠️ Gagal kirim email ke %s: %v", booking.Email, err)
				} else {
					log.Printf("✅ Email konfirmasi terkirim ke %s (Booking: %s)", booking.Email, bookingCode)
				}
			}()
		}

		// ── 2. Kirim WA ke user ────────────────────────────────────────
		if booking.Whatsapp != "" {
			userWANumber := normalizeWANumber(booking.Whatsapp)
			userMsg := BuildUserWAMessage(emailData)

			go func() {
				if err := SendWhatsAppMessage(userWANumber, userMsg); err != nil {
					log.Printf("⚠️ Gagal kirim WA ke user %s: %v", userWANumber, err)
				} else {
					log.Printf("✅ WA konfirmasi terkirim ke user %s (Booking: %s)", userWANumber, bookingCode)
				}
			}()
		}

		// ── 3. Kirim notifikasi WA ke admin ───────────────────────────
		go func() {
			adminMsg := BuildAdminWAMessage(emailData, booking.Whatsapp)
			if err := SendWhatsAppMessage(adminWANumber, adminMsg); err != nil {
				log.Printf("⚠️ Gagal kirim notif WA ke admin: %v", err)
			} else {
				log.Printf("✅ Notif WA admin terkirim (Booking: %s)", bookingCode)
			}
		}()
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Status updated successfully",
		"status":  input.PaymentStatus,
	})
}

// ── LOOKUP RESERVATION (untuk fitur My Reservation) ──────────────────────
// User input kode booking (misal "AB-016") + email → return data tiket

func LookupReservationHandler(c *gin.Context) {
	var input struct {
		BookingCode string `json:"booking_code" binding:"required"`
		Email       string `json:"email"        binding:"required"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Booking code dan email wajib diisi"})
		return
	}

	// Parse ID dari booking code (contoh: "AB-016" → 16)
	bookingID, err := parseBookingCode(input.BookingCode)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Format kode booking tidak valid. Gunakan format AB-001"})
		return
	}

	// Cari di database
	var booking TransportBook
	result := db.Preload("Transport").
		Where("id = ? AND email = ?", bookingID, input.Email).
		First(&booking)

	if result.Error != nil {
		// Booking tidak ditemukan — jangan kasih info terlalu detail (security)
		c.JSON(http.StatusNotFound, gin.H{
			"error": "Reservasi tidak ditemukan. Periksa kembali kode booking dan email kamu.",
		})
		return
	}

	// Susun response data untuk frontend
	transportData := booking.Transport
	departureTime := "07:30"
	if transportData.ID != 0 {
		departureTime = transportData.Time
	}

	response := gin.H{
		"booking_code":        fmt.Sprintf("AB-%03d", booking.ID),
		"customer_name":       booking.CustomerName,
		"first_name":          booking.FirstName,
		"last_name":           booking.LastName,
		"email":               booking.Email,
		"whatsapp":            booking.Whatsapp,
		"route_name":          booking.RouteName,
		"departure_date":      booking.DepartureDate,
		"return_date":         booking.ReturnDate,
		"departure_time":      departureTime,
		"return_time":         booking.ReturnTime,
		"is_round_trip":       booking.IsRoundTrip == 1,
		"total_price":         booking.TotalPrice,
		"payment":             booking.Payment,
		"status":              booking.Status,
		"passanger_full_name": booking.PassangerFullName,
		"passanger_nation":    booking.PassangerNation,
		"passanger_details":   booking.PassangerDetails,
		"transport": gin.H{
			"name": transportData.TransportName,
			"from": transportData.From,
			"to":   transportData.To,
			"time": departureTime,
		},
		"created_at": booking.CreatedAt,
	}

	c.JSON(http.StatusOK, response)
}

// ── DELETE ────────────────────────────────────────────────────────────────

func Deletetransport_bookHandler(c *gin.Context) {
	idStr := c.Param("id")
	id, _ := strconv.Atoi(idStr)
	db.Delete(&TransportBook{}, id)
	c.JSON(http.StatusOK, gin.H{"message": "booking deleted", "id": id})
}

// ── Helper functions ─────────────────────────────────────────────────────

// formatIDR memformat angka float64 ke string IDR (contoh: 320000 → "320.000")
func formatIDR(amount float64) string {
	intAmount := int64(amount)
	str := strconv.FormatInt(intAmount, 10)

	// Tambahkan titik sebagai pemisah ribuan
	result := ""
	for i, ch := range str {
		if i > 0 && (len(str)-i)%3 == 0 {
			result += "."
		}
		result += string(ch)
	}
	return result
}

// normalizeWANumber memastikan nomor WA berformat internasional tanpa +
// Contoh: "08123456789" → "628123456789"
func normalizeWANumber(number string) string {
	if len(number) == 0 {
		return number
	}
	// Jika sudah diawali 62, biarkan
	if len(number) > 2 && number[:2] == "62" {
		return number
	}
	// Ganti awalan 0 dengan 62
	if number[0] == '0' {
		return "62" + number[1:]
	}
	return number
}

// parseBookingCode mengekstrak ID integer dari kode booking
// Contoh: "AB-016" → 16, "AB016" → 16, "ab-016" → 16
func parseBookingCode(code string) (int, error) {
	// Hapus prefix "AB-" atau "AB" (case-insensitive)
	cleaned := ""
	for i, ch := range code {
		if (ch >= '0' && ch <= '9') {
			cleaned = code[i:]
			break
		}
	}
	if cleaned == "" {
		return 0, fmt.Errorf("tidak ada angka dalam kode booking")
	}
	return strconv.Atoi(cleaned)
}