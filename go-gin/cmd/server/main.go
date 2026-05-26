package main

import (
	"log"
	"os"

	"github.com/gin-gonic/gin"
	"github.com/rest-comparison/go-gin/internal/handlers"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

func main() {
	dsn := os.Getenv("DATABASE_URL")
	if dsn == "" {
		dsn = "postgresql://spaceship:spaceship@localhost:5432/spaceship"
	}
	port := os.Getenv("PORT")
	if port == "" {
		port = "3006"
	}

	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{
		Logger:                 logger.Default.LogMode(logger.Silent),
		SkipDefaultTransaction: true,
	})
	if err != nil {
		log.Fatalf("failed to connect database: %v", err)
	}

	r := gin.Default()
	h := handlers.New(db)
	h.RegisterRoutes(r)

	log.Printf("go-gin listening on port %s", port)
	if err := r.Run(":" + port); err != nil {
		log.Fatal(err)
	}
}
