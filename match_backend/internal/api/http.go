package api

import (
	"encoding/json"

	"net/http"

	"fmt"
	"strconv"

	"time"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"
	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"

	"github.com/rishyym0927/match_backend/internal/config"
	"github.com/rishyym0927/match_backend/internal/core"
	"github.com/rishyym0927/match_backend/internal/repo"
	"github.com/rishyym0927/match_backend/internal/storage"
)

// ==================== SERVER STRUCT ====================

type Server struct {
	cfg        config.Config
	repo       *repo.Postgres
	matcher    *core.Matcher
	cloudinary *storage.CloudinaryClient
	jwtSecret  []byte
}

// constructor
func NewServer(cfg config.Config, r *repo.Postgres, m *core.Matcher, cloud *storage.CloudinaryClient) *Server {
	return &Server{
		cfg:        cfg,
		repo:       r,
		matcher:    m,
		cloudinary: cloud,
		jwtSecret:  []byte(cfg.JWTSecret),
	}
}

// ==================== ROUTES ====================

func (s *Server) Routes() http.Handler {
	r := chi.NewRouter()
	r.Use(middleware.Logger)
	r.Use(middleware.Recoverer)

	// CORS middleware
	r.Use(cors.Handler(cors.Options{
		AllowedOrigins:   []string{"*"},
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type"},
		ExposedHeaders:   []string{"Link"},
		AllowCredentials: false,
		MaxAge:           300,
	}))

	// ---- Public routes ----
	r.Get("/api/health", s.health)
	r.Post("/api/auth/signup", s.signup)
	r.Post("/api/auth/login", s.login)

	// ---- Protected routes ----
	r.Group(func(pr chi.Router) {
		pr.Use(s.AuthMiddleware)

		pr.Get("/api/user/profile/{id}", s.getProfile)

		// Chatbot
		pr.Post("/api/chatbot/submit-score", s.submitScore)

		// Matching
		pr.Get("/api/match/recommendations", s.matchRecommendations)
		pr.Post("/api/match/request", s.matchRequest)
		pr.Post("/api/match/respond", s.matchRespond)

		// Chat
		pr.Post("/api/chat/send", s.chatSend)
		pr.Get("/api/chat/{match_id}", s.chatGet)

		// Image uploads
		pr.Post("/api/user/upload", s.uploadUserImages)
		pr.Get("/api/user/images", s.listUserImages)
		pr.Post("/api/user/image/{id}/primary", s.setPrimaryImage)
		pr.Delete("/api/user/image/{id}/delete", s.deleteUserImage)
	})

	return r
}

// ==================== HEALTH ====================

func (s *Server) health(w http.ResponseWriter, _ *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"status": "ok"})
}

// ==================== AUTH ====================

type AuthRequest struct {
	Name     string `json:"name"`
	Email    string `json:"email"`
	Password string `json:"password"`
	Gender   string `json:"gender"`
	Age      int    `json:"age"`
	City     string `json:"city"`
}

func (s *Server) signup(w http.ResponseWriter, r *http.Request) {
	var req AuthRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		s.errorJSON(w, "invalid request body", http.StatusBadRequest)
		return
	}

	// Validation
	if req.Email == "" || req.Password == "" || req.Name == "" {
		s.errorJSON(w, "name, email, and password are required", http.StatusBadRequest)
		return
	}

	hashed, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		s.errorJSON(w, "password hashing failed", http.StatusInternalServerError)
		return
	}

	uid, err := s.repo.CreateUser(r.Context(), repo.SignupInput{
		Name: req.Name, Email: req.Email, PasswordHash: string(hashed), Gender: req.Gender, Age: req.Age, City: req.City,
	})
	if err != nil {
		s.errorJSON(w, "failed to create user: "+err.Error(), http.StatusInternalServerError)
		return
	}

	token := s.createToken(uid)
	s.responseJSON(w, map[string]any{"token": token, "user_id": uid}, http.StatusCreated)
}

func (s *Server) login(w http.ResponseWriter, r *http.Request) {
	var req struct {
		Email    string `json:"email"`
		Password string `json:"password"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		s.errorJSON(w, "invalid request body", http.StatusBadRequest)
		return
	}

	if req.Email == "" || req.Password == "" {
		s.errorJSON(w, "email and password are required", http.StatusBadRequest)
		return
	}

	user, err := s.repo.GetUserByEmail(r.Context(), req.Email)
	if err != nil {
		s.errorJSON(w, "invalid credentials", http.StatusUnauthorized)
		return
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(req.Password)); err != nil {
		s.errorJSON(w, "invalid credentials", http.StatusUnauthorized)
		return
	}

	token := s.createToken(user.ID)
	s.responseJSON(w, map[string]any{"token": token, "user_id": user.ID}, http.StatusOK)
}

func (s *Server) createToken(uid int64) string {
	claims := jwt.MapClaims{
		"user_id": uid,
		"exp":     time.Now().Add(time.Duration(s.cfg.JWTTTLHours) * time.Hour).Unix(),
		"iat":     time.Now().Unix(),
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	signed, err := token.SignedString(s.jwtSecret)
	if err != nil {
		fmt.Println("JWT sign error:", err)
		return ""
	}
	return signed
}

// ==================== USER PROFILE ====================

func (s *Server) getProfile(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.ParseInt(chi.URLParam(r, "id"), 10, 64)
	if err != nil {
		s.errorJSON(w, "invalid user ID", http.StatusBadRequest)
		return
	}

	user, err := s.repo.GetUser(r.Context(), id)
	if err != nil {
		s.errorJSON(w, "user not found", http.StatusNotFound)
		return
	}

	s.responseJSON(w, user, http.StatusOK)
}

// ==================== CHATBOT SCORE ====================

func (s *Server) submitScore(w http.ResponseWriter, r *http.Request) {
	uid := userIDFromCtx(r)
	var sc struct {
		Personality   int `json:"personality"`
		Communication int `json:"communication"`
		Emotional     int `json:"emotional"`
		Confidence    int `json:"confidence"`
	}
	if err := json.NewDecoder(r.Body).Decode(&sc); err != nil {
		s.errorJSON(w, "invalid request body", http.StatusBadRequest)
		return
	}

	// Validate scores (0-100 range)
	if sc.Personality < 0 || sc.Personality > 100 ||
		sc.Communication < 0 || sc.Communication > 100 ||
		sc.Emotional < 0 || sc.Emotional > 100 ||
		sc.Confidence < 0 || sc.Confidence > 100 {
		s.errorJSON(w, "scores must be between 0 and 100", http.StatusBadRequest)
		return
	}

	total := (sc.Personality + sc.Communication + sc.Emotional + sc.Confidence) / 4
	err := s.repo.UpsertScores(r.Context(), uid, sc.Personality, sc.Communication, sc.Emotional, sc.Confidence, total)
	if err != nil {
		s.errorJSON(w, "failed to update scores", http.StatusInternalServerError)
		return
	}

	s.responseJSON(w, map[string]any{"message": "score updated", "total_score": total}, http.StatusOK)
}

// ==================== MATCHING ====================

func (s *Server) matchRecommendations(w http.ResponseWriter, r *http.Request) {
	gender := r.URL.Query().Get("gender")
	ageMin, _ := strconv.Atoi(r.URL.Query().Get("age_min"))
	ageMax, _ := strconv.Atoi(r.URL.Query().Get("age_max"))
	limit, _ := strconv.Atoi(r.URL.Query().Get("limit"))

	if limit <= 0 || limit > 50 {
		limit = 10
	}

	var tg rune
	if gender != "" {
		tg = []rune(gender)[0]
	}

	prefs := core.MatchPrefs{
		TargetGender: tg,
		AgeMin:       ageMin,
		AgeMax:       ageMax,
		Limit:        limit,
		MinScore:     60,
	}

	users, nextCursor, err := s.repo.FetchCandidates(r.Context(), prefs)
	if err != nil {
		s.errorJSON(w, "failed to fetch recommendations", http.StatusInternalServerError)
		return
	}

	s.responseJSON(w, map[string]any{"candidates": users, "next_cursor": nextCursor}, http.StatusOK)
}

func (s *Server) matchRequest(w http.ResponseWriter, r *http.Request) {
	var req struct {
		ReceiverID int64 `json:"receiver_id"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		s.errorJSON(w, "invalid request body", http.StatusBadRequest)
		return
	}

	if req.ReceiverID <= 0 {
		s.errorJSON(w, "invalid receiver_id", http.StatusBadRequest)
		return
	}

	sender := userIDFromCtx(r)
	if sender == req.ReceiverID {
		s.errorJSON(w, "cannot send request to yourself", http.StatusBadRequest)
		return
	}

	if err := s.repo.SendMatchRequest(r.Context(), sender, req.ReceiverID); err != nil {
		s.errorJSON(w, "failed to send match request", http.StatusInternalServerError)
		return
	}

	s.responseJSON(w, map[string]string{"message": "request sent"}, http.StatusOK)
}

func (s *Server) matchRespond(w http.ResponseWriter, r *http.Request) {
	var req struct {
		SenderID int64 `json:"sender_id"`
		Accept   bool  `json:"accept"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		s.errorJSON(w, "invalid request body", http.StatusBadRequest)
		return
	}

	if req.SenderID <= 0 {
		s.errorJSON(w, "invalid sender_id", http.StatusBadRequest)
		return
	}

	receiver := userIDFromCtx(r)
	err := s.repo.RespondMatchRequest(r.Context(), req.SenderID, receiver, req.Accept)
	if err != nil {
		s.errorJSON(w, "failed to respond to match request", http.StatusInternalServerError)
		return
	}

	msg := "rejected"
	if req.Accept {
		msg = "accepted"
	}
	s.responseJSON(w, map[string]string{"message": msg}, http.StatusOK)
}

// ==================== CHAT ====================

func (s *Server) chatSend(w http.ResponseWriter, r *http.Request) {
	var req struct {
		MatchID int64  `json:"match_id"`
		Message string `json:"message"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		s.errorJSON(w, "invalid request body", http.StatusBadRequest)
		return
	}

	if req.MatchID <= 0 || req.Message == "" {
		s.errorJSON(w, "match_id and message are required", http.StatusBadRequest)
		return
	}

	uid := userIDFromCtx(r)
	if _, err := s.repo.InsertMessage(r.Context(), req.MatchID, uid, req.Message); err != nil {
		s.errorJSON(w, "failed to send message", http.StatusInternalServerError)
		return
	}

	s.responseJSON(w, map[string]string{"message": "sent"}, http.StatusOK)
}

func (s *Server) chatGet(w http.ResponseWriter, r *http.Request) {
	matchID, err := strconv.ParseInt(chi.URLParam(r, "match_id"), 10, 64)
	if err != nil {
		s.errorJSON(w, "invalid match_id", http.StatusBadRequest)
		return
	}

	msgs, err := s.repo.GetMessages(r.Context(), matchID, 100)
	if err != nil {
		s.errorJSON(w, "failed to fetch messages", http.StatusInternalServerError)
		return
	}

	s.responseJSON(w, map[string]any{"messages": msgs}, http.StatusOK)
}

// ==================== IMAGE UPLOADS (CLOUDINARY) ====================

func (s *Server) uploadUserImages(w http.ResponseWriter, r *http.Request) {
	uid := userIDFromCtx(r)
	if err := r.ParseMultipartForm(20 << 20); err != nil {
		s.errorJSON(w, "invalid form data", http.StatusBadRequest)
		return
	}

	files := r.MultipartForm.File["images"]
	if len(files) == 0 {
		s.errorJSON(w, "no files provided", http.StatusBadRequest)
		return
	}

	if len(files) > 10 {
		s.errorJSON(w, "maximum 10 images allowed", http.StatusBadRequest)
		return
	}

	var uploaded []string

	for _, fh := range files {
		f, err := fh.Open()
		if err != nil {
			s.errorJSON(w, "failed to open file", http.StatusInternalServerError)
			return
		}
		defer f.Close()

		url, err := s.cloudinary.Upload(r.Context(), f, fh, uid)
		if err != nil {
			s.errorJSON(w, "upload failed: "+err.Error(), http.StatusInternalServerError)
			return
		}

		if err := s.repo.AddUserImage(r.Context(), uid, url); err != nil {
			s.errorJSON(w, "failed to save image", http.StatusInternalServerError)
			return
		}

		uploaded = append(uploaded, url)
	}

	s.responseJSON(w, map[string]any{
		"message":  "upload successful",
		"uploaded": uploaded,
	}, http.StatusOK)
}

func (s *Server) listUserImages(w http.ResponseWriter, r *http.Request) {
	uid := userIDFromCtx(r)
	imgs, err := s.repo.GetUserImages(r.Context(), uid)
	if err != nil {
		s.errorJSON(w, "failed to fetch images", http.StatusInternalServerError)
		return
	}

	s.responseJSON(w, map[string]any{"images": imgs}, http.StatusOK)
}

func (s *Server) setPrimaryImage(w http.ResponseWriter, r *http.Request) {
	uid := userIDFromCtx(r)
	id, err := strconv.ParseInt(chi.URLParam(r, "id"), 10, 64)
	if err != nil {
		s.errorJSON(w, "invalid image ID", http.StatusBadRequest)
		return
	}

	if err := s.repo.SetPrimaryImage(r.Context(), id, uid); err != nil {
		s.errorJSON(w, "failed to set primary image", http.StatusInternalServerError)
		return
	}

	s.responseJSON(w, map[string]string{"message": "primary image set"}, http.StatusOK)
}

func (s *Server) deleteUserImage(w http.ResponseWriter, r *http.Request) {
	uid := userIDFromCtx(r)
	id, err := strconv.ParseInt(chi.URLParam(r, "id"), 10, 64)
	if err != nil {
		s.errorJSON(w, "invalid image ID", http.StatusBadRequest)
		return
	}

	if err := s.repo.DeleteUserImage(r.Context(), id, uid); err != nil {
		s.errorJSON(w, "failed to delete image", http.StatusInternalServerError)
		return
	}

	s.responseJSON(w, map[string]string{"message": "deleted"}, http.StatusOK)
}

// ==================== HELPERS ====================

func (s *Server) responseJSON(w http.ResponseWriter, data any, statusCode int) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(statusCode)
	if err := json.NewEncoder(w).Encode(data); err != nil {
		fmt.Println("JSON encode error:", err)
	}
}

func (s *Server) errorJSON(w http.ResponseWriter, message string, statusCode int) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(statusCode)
	json.NewEncoder(w).Encode(map[string]string{"error": message})
}
