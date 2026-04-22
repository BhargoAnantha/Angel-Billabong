package main

import (
	"net/http"
	"strconv"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type Trips struct {
	gorm.Model
	TripsName string `json:"trips_name"`
	Description string `json:"description"`
	Include string `json:"include"`
	Location string `json:"location"`
	Itenaries string `json:"itenaries"`
	Price float64 `json:price"`
	Image string `json:"image"`
}

func RegisterTripsRouter(r *gin.Engine) {
	r.GET("/api/v1/trips", GetAllTripsHandler)
	r.GET("/api/v1/trips/:name", GetTripsByNameHandler)
    r.POST("/api/v1/trips", CreateTripsHandler)

    r.PUT("/api/v1/trips/:id", UpdateTripsHandler)
    r.DELETE("/api/v1/trips/:id", DeleteTripsHandler)
}

func GetAllTripsHandler(c *gin.Context) {
	var trips []Trips
	if err := db.Find(&trips).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, trips)
}

func GetTripsByNameHandler(c *gin.Context) {
	nameStr := c.Param("name")
	name, _ := strconv.Atoi(nameStr)

	var trips Trips
	if err := db.Where("trips_name = ?", name).Find(&trips).Error; err != nil {
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

	result := db.Create(&trips)
	if result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": result.Error.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "trips created", "data": trips})
}

func UpdateTripsHandler(c *gin.Context) {
	idStr := c.Param("id")
	id, _ := strconv.Atoi(idStr)

	var trips Trips
	result := db.First(&trips, id)
	if result.Error != nil {
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
	idStr := c.Param("id")
	id, _ := strconv.Atoi(idStr)

	var trips Trips
	result := db.First(&trips, id)
	if result.Error != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Trips not found"})
		return
	}

	db.Delete(&trips)
	c.JSON(http.StatusOK, gin.H{"message": "Trips deleted", "id": id})
}