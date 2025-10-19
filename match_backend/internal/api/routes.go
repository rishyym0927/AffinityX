package api

import (
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"
)

// Routes configures and returns the HTTP router
func (s *Server) Routes() http.Handler {
	r := chi.NewRouter()

	// Middleware
	s.setupMiddleware(r)

	// Public routes
	s.setupPublicRoutes(r)

	// Protected routes
	s.setupProtectedRoutes(r)

	return r
}

// setupMiddleware configures router middleware
func (s *Server) setupMiddleware(r *chi.Mux) {
	r.Use(middleware.Logger)
	r.Use(middleware.Recoverer)
	r.Use(cors.Handler(cors.Options{
		AllowedOrigins:   []string{"https://affinity-x-o1wv.vercel.app", "http://localhost:3000"},
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"},
		AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type", "X-Requested-With"},
		ExposedHeaders:   []string{"Link", "Content-Length"},
		AllowCredentials: true,
		MaxAge:           300,
	}))
}

// setupPublicRoutes configures public routes
func (s *Server) setupPublicRoutes(r *chi.Mux) {
	r.Get("/api/health", s.health)
	r.Post("/api/auth/signup", s.signup)
	r.Post("/api/auth/login", s.login)
	r.Post("/api/auth/check-email", s.checkEmail)
}

// setupProtectedRoutes configures protected routes
func (s *Server) setupProtectedRoutes(r *chi.Mux) {
	r.Group(func(pr chi.Router) {
		pr.Use(s.AuthMiddleware)

		// User routes
		pr.Get("/api/user/profile/{id}", s.getProfile)
		pr.Post("/api/user/upload", s.uploadUserImages)
		pr.Get("/api/user/images", s.listUserImages)
		pr.Get("/api/user/images/{id}", s.getUserImagesById)
		pr.Post("/api/user/image/{id}/primary", s.setPrimaryImage)
		pr.Delete("/api/user/image/{id}/delete", s.deleteUserImage)

		// Chatbot routes
		pr.Post("/api/chatbot/submit-score", s.submitScore)

		// Matching routes
		pr.Get("/api/match/recommendations", s.matchRecommendations)
		pr.Get("/api/match/incoming-requests", s.getIncomingRequests)
		pr.Get("/api/match/recent", s.getRecentMatches)
		pr.Post("/api/match/request", s.matchRequest)
		pr.Post("/api/match/reject", s.matchReject)
		pr.Post("/api/match/respond", s.matchRespond)

		// Chat routes
		pr.Post("/api/chat/send", s.chatSend)
		pr.Get("/api/chat/{match_id}", s.chatGet)

		// Statistics routes
		pr.Get("/api/stats/activity", s.getUserStats)
		pr.Get("/api/stats/weekly", s.getWeeklyActivity)
		pr.Get("/api/stats/requests", s.getRequestStats)
		pr.Get("/api/stats/analytics", s.getProfileAnalytics)
		pr.Get("/api/stats/dashboard", s.getDashboardStats)
	})
}

// health returns service health status
func (s *Server) health(w http.ResponseWriter, _ *http.Request) {
	s.responseJSON(w, map[string]string{"status": "ok"}, http.StatusOK)
}
