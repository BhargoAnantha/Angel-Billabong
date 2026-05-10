package main

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

// Transport struct dengan penambahan field untuk mendukung manifest
type Transport struct {
	gorm.Model
	TransportName  string  `json:"transport_name"`
	From           string  `json:"from"`
	To             string  `json:"to"`
	Time           string  `json:"time"`
	Date           string  `json:"date"`
	Price          float64 `json:"price"`
	Status         string  `json:"status"` // e.g., "Tersedia", "Penuh"
	AvailableSeats int     `json:"available_seats"` // Tambahan untuk manajemen kuota
}

func RegisterTransportRouter(r *gin.Engine) {
	// Pastikan group ini sesuai dengan main.go lu
	v1 := r.Group("/api/v1")
	{
		v1.GET("/transport", GetAllTransportHandler)
		v1.GET("/transport/:id", GetTransportByIDHandler) // Tambahan untuk fetch detail spesifik
		v1.GET("/transport/search/:name", GetTransportByNameHandler)
		v1.POST("/transport", CreateTransportHandler)
		v1.PUT("/transport/:id", UpdateTransportHandler)
		v1.DELETE("/transport/:id", DeleteTransportHandler)
	}
}

func GetAllTransportHandler(c *gin.Context) {
	var transport []Transport
	// Order by date dan time agar manifest di admin lebih rapi sesuai keberangkatan
	if err := db.Order("date asc, time asc").Find(&transport).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, transport)
}

// Tambahan: Get ID sangat penting untuk sinkronisasi data di frontend
func GetTransportByIDHandler(c *gin.Context) {
	id := c.Param("id")
	var transport Transport
	if err := db.First(&transport, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Transport tidak ditemukan"})
		return
	}
	c.JSON(http.StatusOK, transport)
}

func GetTransportByNameHandler(c *gin.Context) {
	name := c.Param("name")
	var transport []Transport
	if err := db.Where("transport_name ILIKE ?", "%"+name+"%").Find(&transport).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, transport)
}

func CreateTransportHandler(c *gin.Context) {
	var transport Transport
	if err := c.ShouldBindJSON(&transport); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if err := db.Create(&transport).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "transport created", "data": transport})
}

func UpdateTransportHandler(c *gin.Context) {
	idStr := c.Param("id")
	id, _ := strconv.Atoi(idStr)

	var transport Transport
	if err := db.First(&transport, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "transport not found"})
		return
	}

	if err := c.ShouldBindJSON(&transport); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := db.Save(&transport).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "transport updated", "data": transport})
}

func DeleteTransportHandler(c *gin.Context) {
	idStr := c.Param("id")
	id, _ := strconv.Atoi(idStr)
	if err := db.Delete(&Transport{}, id).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to delete"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "transport deleted", "id": id})
}