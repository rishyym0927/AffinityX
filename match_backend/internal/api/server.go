package api

import (
	"github.com/rishyym0927/match_backend/internal/config"
	"github.com/rishyym0927/match_backend/internal/core"
	"github.com/rishyym0927/match_backend/internal/repo"
	"github.com/rishyym0927/match_backend/internal/storage"
)

// Server encapsulates the HTTP server and its dependencies
type Server struct {
	cfg        config.Config
	repo       *repo.Postgres
	matcher    *core.Matcher
	cloudinary *storage.CloudinaryClient
	jwtSecret  []byte
}

// NewServer creates a new HTTP server instance
func NewServer(cfg config.Config, r *repo.Postgres, m *core.Matcher, cloud *storage.CloudinaryClient) *Server {
	return &Server{
		cfg:        cfg,
		repo:       r,
		matcher:    m,
		cloudinary: cloud,
		jwtSecret:  []byte(cfg.JWTSecret),
	}
}
