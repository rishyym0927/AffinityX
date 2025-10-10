package api

import (
	"encoding/json"

	"net/http"

	"strconv"
	"fmt"

	"time"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
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
		jwtSecret:  []byte("super-secret-key"), // use env var in prod
	}
}

// ==================== ROUTES ====================

func (s *Server) Routes() http.Handler {
	r := chi.NewRouter()
	r.Use(middleware.Logger)
	r.Use(middleware.Recoverer)

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
		http.Error(w, "invalid body", 400)
		return
	}
	hashed, _ := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	uid, err := s.repo.CreateUser(r.Context(), repo.SignupInput{
		Name: req.Name, Email: req.Email, PasswordHash: string(hashed), Gender: req.Gender, Age: req.Age, City: req.City,
	})
	if err != nil {
		http.Error(w, "failed to create user: "+err.Error(), 500)
		return
	}
	token := s.createToken(uid)
	json.NewEncoder(w).Encode(map[string]any{"token": token, "user_id": uid})
}

func (s *Server) login(w http.ResponseWriter, r *http.Request) {
	var req struct {
		Email, Password string
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "invalid body", 400)
		return
	}
	user, err := s.repo.GetUserByEmail(r.Context(), req.Email)
	if err != nil || bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(req.Password)) != nil {
		http.Error(w, "invalid credentials", 401)
		return
	}
	token := s.createToken(user.ID)
	json.NewEncoder(w).Encode(map[string]any{"token": token, "user_id": user.ID})
}

func (s *Server) createToken(uid int64) string {
    claims := jwt.MapClaims{
        "user_id": uid,
        "exp":     time.Now().Add(72 * time.Hour).Unix(),
    }
    token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
    signed, err := token.SignedString(s.jwtSecret)
    if err != nil {
        fmt.Println("JWT sign error:", err)
    }
    return signed
}


// ==================== USER PROFILE ====================

func (s *Server) getProfile(w http.ResponseWriter, r *http.Request) {
	id, _ := strconv.ParseInt(chi.URLParam(r, "id"), 10, 64)
	user, err := s.repo.GetUser(r.Context(), id)
	if err != nil {
		http.Error(w, "user not found", 404)
		return
	}
	json.NewEncoder(w).Encode(user)
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
		http.Error(w, "invalid json", 400)
		return
	}
	total := (sc.Personality + sc.Communication + sc.Emotional + sc.Confidence) / 4
	err := s.repo.UpsertScores(r.Context(), uid, sc.Personality, sc.Communication, sc.Emotional, sc.Confidence, total)
	if err != nil {
		http.Error(w, "db error: "+err.Error(), 500)
		return
	}
	json.NewEncoder(w).Encode(map[string]any{"message": "score updated", "total_score": total})
}

// ==================== MATCHING ====================

func (s *Server) matchRecommendations(w http.ResponseWriter, r *http.Request) {
	gender := r.URL.Query().Get("gender")
	ageMin, _ := strconv.Atoi(r.URL.Query().Get("age_min"))
	ageMax, _ := strconv.Atoi(r.URL.Query().Get("age_max"))
	limit, _ := strconv.Atoi(r.URL.Query().Get("limit"))
	if limit == 0 {
		limit = 10
	}

	// core.MatchPrefs uses TargetGender as rune and doesn't have ViewerID; adapt accordingly
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

	users, _, err := s.repo.FetchCandidates(r.Context(), prefs)
	if err != nil {
		http.Error(w, "db error: "+err.Error(), 500)
		return
	}
	json.NewEncoder(w).Encode(map[string]any{"candidates": users})
}

func (s *Server) matchRequest(w http.ResponseWriter, r *http.Request) {
	var req struct {
		ReceiverID int64 `json:"receiver_id"`
	}
	json.NewDecoder(r.Body).Decode(&req)
	sender := userIDFromCtx(r)
	if err := s.repo.SendMatchRequest(r.Context(), sender, req.ReceiverID); err != nil {
		http.Error(w, err.Error(), 500)
		return
	}
	json.NewEncoder(w).Encode(map[string]string{"message": "request sent"})
}

func (s *Server) matchRespond(w http.ResponseWriter, r *http.Request) {
	var req struct {
		SenderID int64 `json:"sender_id"`
		Accept   bool  `json:"accept"`
	}
	json.NewDecoder(r.Body).Decode(&req)
	receiver := userIDFromCtx(r)
	err := s.repo.RespondMatchRequest(r.Context(), req.SenderID, receiver, req.Accept)
	if err != nil {
		http.Error(w, err.Error(), 500)
		return
	}
	msg := "rejected"
	if req.Accept {
		msg = "accepted"
	}
	json.NewEncoder(w).Encode(map[string]string{"message": msg})
}

// ==================== CHAT ====================

func (s *Server) chatSend(w http.ResponseWriter, r *http.Request) {
	var req struct {
		MatchID int64  `json:"match_id"`
		Message string `json:"message"`
	}
	json.NewDecoder(r.Body).Decode(&req)
	uid := userIDFromCtx(r)
	if _, err := s.repo.InsertMessage(r.Context(), req.MatchID, uid, req.Message); err != nil {
		http.Error(w, "send failed", 500)
		return
	}
	json.NewEncoder(w).Encode(map[string]string{"message": "sent"})
}

func (s *Server) chatGet(w http.ResponseWriter, r *http.Request) {
	matchID, _ := strconv.ParseInt(chi.URLParam(r, "match_id"), 10, 64)
	msgs, err := s.repo.GetMessages(r.Context(), matchID, 100)
	if err != nil {
		http.Error(w, "fetch failed", 500)
		return
	}
	json.NewEncoder(w).Encode(map[string]any{"messages": msgs})
}

// ==================== IMAGE UPLOADS (CLOUDINARY) ====================

func (s *Server) uploadUserImages(w http.ResponseWriter, r *http.Request) {
	uid := userIDFromCtx(r)
	if err := r.ParseMultipartForm(20 << 20); err != nil {
		http.Error(w, "invalid form", 400)
		return
	}

	files := r.MultipartForm.File["images"]
	if len(files) == 0 {
		http.Error(w, "no files", 400)
		return
	}

	var uploaded []string
	// repo provides GetUserImages and AddUserImage/SetPrimaryImage; no HasPrimaryImage helper

	for _, fh := range files {
		f, err := fh.Open()
		if err != nil {
			http.Error(w, "open failed", 500)
			return
		}
		defer f.Close()

		url, err := s.cloudinary.Upload(r.Context(), f, fh, uid)
		if err != nil {
			http.Error(w, "upload failed: "+err.Error(), 500)
			return
		}
		if err := s.repo.AddUserImage(r.Context(), uid, url); err != nil {
			http.Error(w, "db failed", 500)
			return
		}
		uploaded = append(uploaded, url)
	}
	if len(uploaded) > 0 {
		// set first uploaded as primary
		// need image id to set primary; repo currently doesn't return the id on AddUserImage,
		// so skipping automatic primary set for now.
	}

	json.NewEncoder(w).Encode(map[string]any{
		"message":  "upload successful",
		"uploaded": uploaded,
	})
}

func (s *Server) listUserImages(w http.ResponseWriter, r *http.Request) {
	uid := userIDFromCtx(r)
	imgs, err := s.repo.GetUserImages(r.Context(), uid)
	if err != nil {
		http.Error(w, "db error", 500)
		return
	}
	json.NewEncoder(w).Encode(map[string]any{"images": imgs})
}

func (s *Server) setPrimaryImage(w http.ResponseWriter, r *http.Request) {
	uid := userIDFromCtx(r)
	id, _ := strconv.ParseInt(chi.URLParam(r, "id"), 10, 64)
	if err := s.repo.SetPrimaryImage(r.Context(), id, uid); err != nil {
		http.Error(w, "failed", 500)
		return
	}
	json.NewEncoder(w).Encode(map[string]string{"message": "primary image set"})
}

func (s *Server) deleteUserImage(w http.ResponseWriter, r *http.Request) {
	uid := userIDFromCtx(r)
	id, _ := strconv.ParseInt(chi.URLParam(r, "id"), 10, 64)
	err := s.repo.DeleteUserImage(r.Context(), id, uid)
	if err != nil {
		http.Error(w, "failed", 500)
		return
	}
	json.NewEncoder(w).Encode(map[string]string{"message": "deleted"})
}
