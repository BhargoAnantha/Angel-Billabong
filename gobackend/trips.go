package main

import (
	"net/http"
	//"strconv"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type Trips struct {
	gorm.Model
	TripsName   string  `json:"trips_name"`
	Description string  `json:"description"`
	Include     string  `json:"include"`
	Location    string  `json:"location"`
	Itenaries   string  `json:"itenaries"`
	Price       float64 `json:"price"` // Huruf kecil 'p' agar konsisten dengan JSON standar
	Image       string  `json:"image"`
}

func RegisterTripsRouter(r *gin.Engine) {
	v1 := r.Group("/api/v1")
	{
		v1.GET("/trips", GetAllTripsHandler)
		v1.GET("/trips/:id", GetTripByIDHandler)             // 🔥 TAMBAHKAN INI: Agar tidak 404
		v1.GET("/trips/search/:name", GetTripsByNameHandler) 
		v1.POST("/trips", CreateTripsHandler)
		v1.PUT("/trips/:id", UpdateTripsHandler)
		v1.DELETE("/trips/:id", DeleteTripsHandler)
	}
}

// Handler untuk mendapatkan detail berdasarkan ID
func GetTripByIDHandler(c *gin.Context) {
	id := c.Param("id")
	var trip Trips
	if err := db.First(&trip, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Trip tidak ditemukan"})
		return
	}
	c.JSON(http.StatusOK, trip)
}

func GetAllTripsHandler(c *gin.Context) {
	var trips []Trips
	if err := db.Order("id asc").Find(&trips).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, trips)
}

func GetTripsByNameHandler(c *gin.Context) {
	name := c.Param("name")
	var trips []Trips
	if err := db.Where("trips_name ILIKE ?", "%"+name+"%").Find(&trips).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, trips)
}

func CreateTripsHandler(c *gin.Context) {
	var trips Trips
	if err := c.ShouldBindJSON(&trips); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	db.Create(&trips)
	c.JSON(http.StatusOK, gin.H{"message": "trips created", "data": trips})
}

func UpdateTripsHandler(c *gin.Context) {
	id := c.Param("id")
	var trips Trips
	if err := db.First(&trips, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Trips not found"})
		return
	}
	if err := c.ShouldBindJSON(&trips); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	db.Save(&trips)
	c.JSON(http.StatusOK, gin.H{"message": "Trips updated", "data": trips})
}

func DeleteTripsHandler(c *gin.Context) {
	id := c.Param("id")
	var trips Trips
	if err := db.First(&trips, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Trips not found"})
		return
	}
	db.Delete(&trips)
	c.JSON(http.StatusOK, gin.H{"message": "Trips deleted", "id": id})
}