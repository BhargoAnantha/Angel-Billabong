package main

import (
	"fmt"
	"log"
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type TripBook struct {
	gorm.Model
	CustomerName    string  `json:"customer_name"`
	Email           string  `json:"email"`
	Whatsapp        string  `json:"whatsapp"`
	BookingDate     string  `json:"booking_date"`
	TotalPassengers int     `json:"total_passengers"`
	TotalPrice      float64 `json:"total_price"`
	Payment         string  `json:"payment"`
	Status          string  `json:"status"`
	TripsID         uint    `json:"trips_id"`
	Trips           Trips   `gorm:"foreignKey:TripsID" json:"trips_details"`
	BookingCode     string  `json:"booking_code"`
	FullName        string  `json:"full_name"`
	Date            string  `json:"date"`
	Travelers       string  `json:"travelers"`

	// ✅ FIX: Field baru untuk menyimpan nama paket tour dari frontend
	// Ini yang ditampilkan di kolom "Paket Tour" pada halaman admin
	TourName string `json:"tour_name"`
	TripName string `json:"trip_name"`
}

func Registertrip_bookRouter(r *gin.Engine) {
	api := r.Group("/api/v1")
	{
		api.POST("/trip-books", Createtrip_bookHandler)
		api.GET("/trip-books", Gettrip_bookHandler)
		api.GET("/trip-books/:id", Gettrip_bookHandlerById)
		api.PUT("/trip-books/:id", Updatetrip_bookHandler)
		api.PATCH("/trip-books/:id/status", UpdateTripStatusHandler)
		api.DELETE("/trip-books/:id", Deletetrip_bookHandler)

		// Endpoint lookup My Reservation untuk trip
		api.POST("/trip-books/lookup", LookupTripReservationHandler)
	}
}

func Gettrip_bookHandler(c *gin.Context) {
	var trip_books []TripBook
	if err := db.Preload("Trips").Order("id desc").Find(&trip_books).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Gagal mengambil data", "error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": trip_books})
}

func Gettrip_bookHandlerById(c *gin.Context) {
	id := c.Param("id")
	var trip_book TripBook
	if err := db.Preload("Trips").First(&trip_book, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"message": "Booking tidak ditemukan"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": trip_book})
}

func Createtrip_bookHandler(c *gin.Context) {
	var trip_book TripBook
	if err := c.ShouldBindJSON(&trip_book); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Data tidak valid", "error": err.Error()})
		return
	}

	if trip_book.FullName == "" {
		trip_book.FullName = trip_book.CustomerName
	}
	if trip_book.Date == "" {
		trip_book.Date = trip_book.BookingDate
	}
	if trip_book.Travelers == "" {
		trip_book.Travelers = strconv.Itoa(trip_book.TotalPassengers) + " Person"
	}
	if trip_book.Status == "" {
		trip_book.Status = "Pending"
	}

	// Simpan dulu tanpa BookingCode agar ID ter-generate oleh DB
	if err := db.Create(&trip_book).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Gagal menyimpan ke database"})
		return
	}

	// Generate BookingCode dari ID (TAB-001) dan update
	trip_book.BookingCode = fmt.Sprintf("TAB-%03d", trip_book.ID)
	db.Model(&trip_book).Update("booking_code", trip_book.BookingCode)

	c.JSON(http.StatusOK, gin.H{"message": "Booking created", "data": trip_book})
}

func Updatetrip_bookHandler(c *gin.Context) {
	id := c.Param("id")
	var trip_book TripBook

	if err := db.First(&trip_book, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"message": "Booking tidak ditemukan"})
		return
	}

	if err := c.ShouldBindJSON(&trip_book); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Data tidak valid"})
		return
	}

	db.Save(&trip_book)
	c.JSON(http.StatusOK, gin.H{"message": "Booking updated", "data": trip_book})
}

// ── UPDATE STATUS dengan trigger email + WA ───────────────────────────────

func UpdateTripStatusHandler(c *gin.Context) {
	id := c.Param("id")

	var input struct {
		Status string `json:"status"`
	}
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Format data salah"})
		return
	}

	if err := db.Model(&TripBook{}).Where("id = ?", id).Update("status", input.Status).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal update status"})
		return
	}

	if input.Status == "Sukses" {
		var booking TripBook
		if err := db.Preload("Trips").First(&booking, id).Error; err != nil {
			log.Printf("⚠️ Gagal ambil data trip booking untuk notifikasi (ID: %s): %v", id, err)
			c.JSON(http.StatusOK, gin.H{"message": "Status updated. Notifikasi gagal dikirim."})
			return
		}

		bookingCode := booking.BookingCode
		if bookingCode == "" {
			bookingCode = fmt.Sprintf("TAB-%03d", booking.ID)
			db.Model(&booking).Update("booking_code", bookingCode)
		}

		// ✅ FIX: Prioritaskan TourName/TripName yang tersimpan dari frontend
		// Fallback ke relasi Trips jika field kosong (untuk data lama)
		tripLocation := "Nusa Penida"
		tripName     := "Paket Tour"

		if booking.TourName != "" {
			tripName = booking.TourName
		} else if booking.TripName != "" {
			tripName = booking.TripName
		} else if booking.Trips.ID != 0 {
			if booking.Trips.TripsName != "" {
				tripName = booking.Trips.TripsName
			}
		}

		if booking.Trips.ID != 0 && booking.Trips.Location != "" {
			tripLocation = booking.Trips.Location
		}

		totalFormatted := formatIDR(booking.TotalPrice)

		emailData := EmailData{
			FirstName:     booking.FullName,
			CustomerName:  booking.CustomerName,
			BookingCode:   bookingCode,
			RouteName:     fmt.Sprintf("%s — %s", tripName, tripLocation),
			DepartureDate: booking.Date,
			ReturnDate:    "",
			DepartureTime: "",
			TotalPrice:    totalFormatted,
			Payment:       booking.Payment,
			IsRoundTrip:   false,
		}

		// 1. Kirim email ke user
		if booking.Email != "" {
			go func() {
				if err := SendBookingConfirmationEmail(booking.Email, emailData); err != nil {
					log.Printf("⚠️ Gagal kirim email trip ke %s: %v", booking.Email, err)
				} else {
					log.Printf("✅ Email trip terkirim ke %s (Booking: %s)", booking.Email, bookingCode)
				}
			}()
		} else {
			log.Printf("⚠️ Trip booking %s tidak punya email, skip kirim email", bookingCode)
		}

		// 2. Kirim WA ke user
		if booking.Whatsapp != "" {
			userWANumber := normalizeWANumber(booking.Whatsapp)
			userMsg := BuildTripUserWAMessage(booking, bookingCode, totalFormatted, tripName, tripLocation)

			go func() {
				if err := SendWhatsAppMessage(userWANumber, userMsg); err != nil {
					log.Printf("⚠️ Gagal kirim WA trip ke user %s: %v", userWANumber, err)
				} else {
					log.Printf("✅ WA trip terkirim ke user %s (Booking: %s)", userWANumber, bookingCode)
				}
			}()
		}

		// 3. Kirim notif WA ke admin
		go func() {
			adminMsg := BuildTripAdminWAMessage(booking, bookingCode, totalFormatted, tripName, tripLocation)
			if err := SendWhatsAppMessage(adminWANumber, adminMsg); err != nil {
				log.Printf("⚠️ Gagal kirim notif WA admin trip: %v", err)
			} else {
				log.Printf("✅ Notif WA admin trip terkirim (Booking: %s)", bookingCode)
			}
		}()
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Status updated successfully",
		"status":  input.Status,
	})
}

// ── LOOKUP RESERVATION untuk Trip ────────────────────────────────────────

func LookupTripReservationHandler(c *gin.Context) {
	var input struct {
		BookingCode string `json:"booking_code" binding:"required"`
		Email       string `json:"email"        binding:"required"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Booking code dan email wajib diisi"})
		return
	}

	var booking TripBook
	result := db.Preload("Trips").
		Where("booking_code = ? AND email = ?", input.BookingCode, input.Email).
		First(&booking)

	if result.Error != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"error": "Reservasi tidak ditemukan. Periksa kembali kode booking dan email kamu.",
		})
		return
	}

	// ✅ FIX: Gunakan TourName/TripName yang tersimpan, fallback ke relasi
	tripName     := booking.TourName
	tripLocation := "Nusa Penida"

	if tripName == "" {
		tripName = booking.TripName
	}
	if tripName == "" && booking.Trips.ID != 0 {
		if booking.Trips.TripsName != "" {
			tripName = booking.Trips.TripsName
		}
	}
	if tripName == "" {
		tripName = "Paket Tour"
	}
	if booking.Trips.ID != 0 && booking.Trips.Location != "" {
		tripLocation = booking.Trips.Location
	}

	c.JSON(http.StatusOK, gin.H{
		"booking_code":     booking.BookingCode,
		"customer_name":    booking.CustomerName,
		"full_name":        booking.FullName,
		"email":            booking.Email,
		"whatsapp":         booking.Whatsapp,
		"date":             booking.Date,
		"travelers":        booking.Travelers,
		"total_passengers": booking.TotalPassengers,
		"total_price":      booking.TotalPrice,
		"payment":          booking.Payment,
		"status":           booking.Status,
		"trip_name":        tripName,
		"trip_location":    tripLocation,
		"tour_name":        booking.TourName,
		"booking_type":     "trip",
		"created_at":       booking.CreatedAt,
	})
}

func Deletetrip_bookHandler(c *gin.Context) {
	id := c.Param("id")
	if err := db.Delete(&TripBook{}, id).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Gagal menghapus"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Booking deleted"})
}

// ── WA message builders khusus trip ──────────────────────────────────────

func BuildTripUserWAMessage(b TripBook, bookingCode, totalFormatted, tripName, tripLocation string) string {
	return fmt.Sprintf(
		`✅ *Booking Paket Tour Dikonfirmasi!*
Angel Billabong Fast Cruise

Halo *%s*! Booking paket tour kamu sudah dikonfirmasi.

📋 *Detail Booking:*
━━━━━━━━━━━━━━━━━━
🎫 Kode Booking  : *%s*
🏝️ Paket         : %s
📍 Lokasi        : %s
📅 Tanggal       : %s
👥 Travelers     : %s
💳 Metode Bayar  : %s
💰 Total         : IDR %s
━━━━━━━━━━━━━━━━━━

📌 *Cara Cek Reservasi:*
Kunjungi website kami → klik *My Reservation* → masukkan kode *%s* dan email kamu.

Sampai jumpa di Nusa Penida! 🌊`,
		b.CustomerName,
		bookingCode,
		tripName,
		tripLocation,
		b.Date,
		b.Travelers,
		b.Payment,
		totalFormatted,
		bookingCode,
	)
}

func BuildTripAdminWAMessage(b TripBook, bookingCode, totalFormatted, tripName, tripLocation string) string {
	return fmt.Sprintf(
		`🔔 *Notifikasi Admin — Trip Booking Sukses*
Angel Billabong Internal

━━━━━━━━━━━━━━━━━━
🎫 Kode     : *%s*
👤 Pemesan  : %s
📱 WA       : %s
🏝️ Paket    : %s — %s
📅 Tanggal  : %s
👥 Travelers: %s
💰 Total    : IDR %s
━━━━━━━━━━━━━━━━━━

Email & WA konfirmasi telah dikirim ke user.`,
		bookingCode,
		b.CustomerName,
		b.Whatsapp,
		tripName,
		tripLocation,
		b.Date,
		b.Travelers,
		totalFormatted,
	)
}

var _ = time.Now