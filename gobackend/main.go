package main

import (
	"log"
	"net/http"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger" // Tambahkan logger untuk memantau SQL
)

var db *gorm.DB
var jwtSecret = []byte("ANGEL_BILLABONG_SECRET_KEY")

func main() {
	// DSN menggunakan port 5433 sesuai setup kamu
	dsn := "host=localhost user=postgres password=Bhargoo_29 dbname=angelbillabong_skema port=5433 sslmode=disable"

	var err error
	// Tambahkan Config Logger agar kita bisa lihat di terminal jika ada tabel yang gagal dibuat
	db, err = gorm.Open(postgres.Open(dsn), &gorm.Config{
		Logger: logger.Default.LogMode(logger.Info),
	})
	
	if err != nil {
		log.Fatal("❌ Gagal koneksi database:", err)
	}

	// Pastikan koneksi pool tetap terjaga
	sqlDB, _ := db.DB()
	sqlDB.SetMaxIdleConns(10)
	sqlDB.SetMaxOpenConns(100)
	sqlDB.SetConnMaxLifetime(time.Hour)

	r := gin.Default()

	// 1. CONFIG CORS (Sangat penting agar Frontend Vite tidak diblokir)
	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:5173"},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Accept", "Authorization", "X-Requested-With"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}))

	// 2. AUTOMIGRATE
	// PENTING: Jika kolom baru belum muncul di DB, AutoMigrate ini yang bertugas membuatnya.
	log.Println("🔄 Running AutoMigrate...")
	err = db.AutoMigrate(
		&Trips{}, 
		&Transport{}, 
		&TripBook{}, 
		&TransportBook{}, // Struct ini sekarang sudah punya field Round Trip
	)
	if err != nil {
		log.Fatal("❌ AutoMigrate Gagal:", err)
	}
	log.Println("✅ AutoMigrate Sukses")

	// 3. API ROUTES
	api := r.Group("/api/v1")
	{
		api.POST("/login", handleLogin)
	}

	// 4. DAFTARKAN ROUTER DARI FILE EKSTERNAL
	RegisterTripsRouter(r)
	RegisterTransportRouter(r)
	Registertrip_bookRouter(r) 
	Registertransport_bookRouter(r)

	log.Println("🚀 Angel Billabong Backend running on http://localhost:8080")
	r.Run(":8080")
}

// Handler Login untuk Admin (Bhargo Anantha)
func handleLogin(c *gin.Context) {
	var input struct {
		Username string `json:"username"`
		Password string `json:"password"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Input tidak valid"})
		return
	}

	if input.Username == "admin" && input.Password == "admin123" {
		token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
			"username": input.Username,
			"role":     "Super Admin",
			"exp":      time.Now().Add(time.Hour * 24).Unix(),
		})

		tokenString, err := token.SignedString(jwtSecret)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"message": "Gagal generate token"})
			return
		}

		c.JSON(http.StatusOK, gin.H{
			"message": "Login Berhasil",
			"token":   tokenString,
			"user": gin.H{
				"username": "Bhargo Anantha",
				"role":     "Super Admin",
			},
		})
		return
	}

	c.JSON(http.StatusUnauthorized, gin.H{"message": "Username atau Password salah!"})
}