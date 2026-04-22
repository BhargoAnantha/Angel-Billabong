package main

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type TripBook struct {
	gorm.Model
	TripBookName string `json:"trip_book_name"`
	Whatsapp string `json:"whatsapp"`
	FullName string `json:"full_name"`
	Payment string `json:"payment"`
	Date string `json:"date"`
	Travelers string `json:"travelers"`
	Tour string `json:"tour"`
	TripsID string `json:"trips_id"`
	Trips Trips `gorm:"foreignKey:TripsID;references:ID"`
	BookingCode string `json:"booking_code"`

}

func Registertrip_bookRouter(r *gin.Engine) {
	r.GET("/api/v1/trip_book", GetAlltrip_bookHandler)
    r.POST("/api/v1/trip_book", Createtrip_bookHandler)

    r.PUT("/api/v1/trip_book/:id", Updatetrip_bookHandler)
    r.DELETE("/api/v1/trip_book/:id", Deletetrip_bookHandler)
}

func GetAlltrip_bookHandler(c *gin.Context) {
	var trip_book []TripBook
	result := db.Preload("Trips").Find(&trip_book)
	if result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": result.Error.Error()})
		return
	}
	c.JSON(http.StatusOK, trip_book)
}

func Createtrip_bookHandler(c *gin.Context) {
	var trip_book TripBook
	if err := c.ShouldBindJSON(&trip_book); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	result := db.Create(&trip_book)
	if result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": result.Error.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "trip_book created", "data": trip_book})
}

func Updatetrip_bookHandler(c *gin.Context) {
	idStr := c.Param("id")
	id, _ := strconv.Atoi(idStr)

	var trip_book TripBook
	result := db.First(&trip_book, id)
	if result.Error != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "trip_book not found"})
		return
	}

	if err := c.ShouldBindJSON(&trip_book); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	db.Save(&trip_book)
	c.JSON(http.StatusOK, gin.H{"message": "trip_book updated", "data": trip_book})
}

func Deletetrip_bookHandler(c *gin.Context) {
	idStr := c.Param("id")
	id, _ := strconv.Atoi(idStr)

	var trip_book TripBook
	result := db.First(&trip_book, id)
	if result.Error != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "trip_book not found"})
		return
	}

	db.Delete(&trip_book)
	c.JSON(http.StatusOK, gin.H{"message": "trip_book deleted", "id": id})
}