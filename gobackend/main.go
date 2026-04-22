package main

import (
	"log"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

var db *gorm.DB

func main() {
	dsn := "host=localhost user=postgres password=Bhargoo_29 dbname=angelbillabong_skema port=5433 sslmode=disable"

	var err error
	db, err = gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatal("Gagal koneksi database:", err)
	}

	r := gin.Default()

	// FIX CORS: Pastikan konfigurasi ini ada sebelum Router
	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:5173"}, // Sesuaikan port React kamu
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Accept", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}))

	// AutoMigrate menggunakan struct dari file lain
	db.AutoMigrate(&Trips{}, &Transport{}, &TripBook{}, &TransportBook{})

	RegisterTripsRouter(r)
	RegisterTransportRouter(r)
	Registertrip_bookRouter(r)
	Registertransport_bookRouter(r)

	log.Println("✅ Backend running on http://localhost:8080")
	r.Run(":8080")
}