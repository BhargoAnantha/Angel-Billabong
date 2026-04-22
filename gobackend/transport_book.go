package main

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type TransportBook struct {
	gorm.Model
	TransportBookName string `json:"transport_book_name"`
	FirstName string `json:"first_name"`
	LastName string `json:"last_name"`
	Email string `json:"email"`
	Payment string `json:"payment"`
	TransportID uint `json:"transport_id"`
	Transport Transport `gorm:"foreignKey:TransportID;references:ID"`
	PassangerGender string `json:"passanger_email"`
	PassangerFullName string `json:"passanger_full_name"`
	PassangerAge string `json:"passanger_age"`
	PassangerNation string `json:"passanger_nation"`
}

func Registertransport_bookRouter(r *gin.Engine) {
	r.GET("/api/v1/transport_book", GetAlltransport_bookHandler)
    r.POST("/api/v1/transport_book", Createtransport_bookHandler)

    r.PUT("/api/v1/transport_book/:id", Updatetransport_bookHandler)
    r.DELETE("/api/v1/transport_book/:id", Deletetransport_bookHandler)
}

func GetAlltransport_bookHandler(c *gin.Context) {
	var transport_book []TransportBook
	result := db.Preload("Transport").Find(&transport_book)
	if result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": result.Error.Error()})
		return
	}
	c.JSON(http.StatusOK, transport_book)
}

func Createtransport_bookHandler(c *gin.Context) {
	var transport_book TransportBook
	if err := c.ShouldBindJSON(&transport_book); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	result := db.Create(&transport_book)
	if result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": result.Error.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "transport_book created", "data": transport_book})
}

func Updatetransport_bookHandler(c *gin.Context) {
	idStr := c.Param("id")
	id, _ := strconv.Atoi(idStr)

	var transport_book TransportBook
	result := db.First(&transport_book, id)
	if result.Error != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "transport_book not found"})
		return
	}

	if err := c.ShouldBindJSON(&transport_book); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	db.Save(&transport_book)
	c.JSON(http.StatusOK, gin.H{"message": "transport_book updated", "data": transport_book})
}

func Deletetransport_bookHandler(c *gin.Context) {
	idStr := c.Param("id")
	id, _ := strconv.Atoi(idStr)

	var transport_book TransportBook
	result := db.First(&transport_book, id)
	if result.Error != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "transport_book not found"})
		return
	}

	db.Delete(&transport_book)
	c.JSON(http.StatusOK, gin.H{"message": "transport_book deleted", "id": id})
}