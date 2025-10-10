package main

import (
	"context"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"

	"github.com/rishyym0927/match_backend/internal/api"
	"github.com/rishyym0927/match_backend/internal/config"
	"github.com/rishyym0927/match_backend/internal/core"
	"github.com/rishyym0927/match_backend/internal/repo"
	"github.com/rishyym0927/match_backend/internal/storage"
)

func main() {
	cfg := config.Load()
	ctx := context.Background()

	// Init Cloudinary
	cloud, err := storage.NewCloudinary()
	if err != nil {
		log.Fatal("Cloudinary init failed:", err)
	}

	// Connect DB
	pg, err := repo.NewPostgres(ctx, cfg.PostgresDSN)
	if err != nil {
		log.Fatal("DB error:", err)
	}
	defer pg.Close()

	matcher := core.NewMatcher(pg)

	// Create API server
	server := api.NewServer(cfg, pg, matcher, cloud)

	srv := &http.Server{
		Addr:    ":" + cfg.Port,
		Handler: server.Routes(),
	}

	go func() {
		log.Printf("🚀 Listening on :%s", cfg.Port)
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatal(err)
		}
	}()

	// Graceful shutdown
	stop := make(chan os.Signal, 1)
	signal.Notify(stop, syscall.SIGINT, syscall.SIGTERM)
	<-stop
	log.Println("🛑 Shutting down...")
	_ = srv.Shutdown(context.Background())
}
