package main

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type Transport struct {
	gorm.Model
	transportName string `json:"transport_name"`
	From string `json:"from"`
	To string `json:"to"`
	Time string `json:"time"`
	Date string `json:"date"`
	Passangerdetails string `json:"passanger_details"`
	Price float64 `json:"price"`
	Status string `json:"status"`
}

func RegisterTransportRouter(r *gin.Engine) {
	r.GET("/api/v1/transport", GetAllTransportHandler)
	r.GET("/api/v1/transport/:name", GetTransportByNameHandler)
    r.POST("/api/v1/transport", CreateTransportHandler)

    r.PUT("/api/v1/transport/:id", UpdateTransportHandler)
    r.DELETE("/api/v1/transport/:id", DeleteTransportHandler)
}

func GetAllTransportHandler(c *gin.Context) {
	var transport []Transport
	if err := db.Find(&transport).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, transport)
}

func GetTransportByNameHandler(c *gin.Context) {
	nameStr := c.Param("name")
	name, _ := strconv.Atoi(nameStr)

	var transport Transport
	if err := db.Where("transport_name = ?", name).Find(&transport).Error; err != nil {
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

	result := db.Create(&transport)
	if result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": result.Error.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "transport created", "data": transport})
}

func UpdateTransportHandler(c *gin.Context) {
	idStr := c.Param("id")
	id, _ := strconv.Atoi(idStr)

	var transport Transport
	result := db.First(&transport, id)
	if result.Error != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "transport not found"})
		return
	}

	if err := c.ShouldBindJSON(&transport); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	db.Save(&transport)
	c.JSON(http.StatusOK, gin.H{"message": "transport updated", "data": transport})
}

func DeleteTransportHandler(c *gin.Context) {
	idStr := c.Param("id")
	id, _ := strconv.Atoi(idStr)

	var transport Transport
	result := db.First(&transport, id)
	if result.Error != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "transport not found"})
		return
	}

	db.Delete(&transport)
	c.JSON(http.StatusOK, gin.H{"message": "transport deleted", "id": id})
}