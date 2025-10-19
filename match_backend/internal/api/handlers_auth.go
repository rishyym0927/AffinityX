package api

import (
	"encoding/json"
	"net/http"

	"golang.org/x/crypto/bcrypt"

	"github.com/rishyym0927/match_backend/internal/repo"
)

// signup handles user registration
func (s *Server) signup(w http.ResponseWriter, r *http.Request) {
	var req AuthRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		s.errorJSON(w, "invalid request body", http.StatusBadRequest)
		return
	}

	// Validate required fields
	if err := s.validateSignupRequest(&req); err != nil {
		s.errorJSON(w, err.Error(), http.StatusBadRequest)
		return
	}

	// Hash password
	hashed, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		s.errorJSON(w, "password hashing failed", http.StatusInternalServerError)
		return
	}

	// Create user
	uid, err := s.repo.CreateUser(r.Context(), repo.SignupInput{
		Name:         req.Name,
		Email:        req.Email,
		PasswordHash: string(hashed),
		Gender:       req.Gender,
		Age:          req.Age,
		City:         req.City,
	})
	if err != nil {
		s.errorJSON(w, "failed to create user: "+err.Error(), http.StatusInternalServerError)
		return
	}

	token := s.createToken(uid)
	s.responseJSON(w, map[string]any{
		"token":   token,
		"user_id": uid,
	}, http.StatusCreated)
}

// login handles user authentication
func (s *Server) login(w http.ResponseWriter, r *http.Request) {
	var req LoginRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		s.errorJSON(w, "invalid request body", http.StatusBadRequest)
		return
	}

	// Validate required fields
	if req.Email == "" || req.Password == "" {
		s.errorJSON(w, "email and password are required", http.StatusBadRequest)
		return
	}

	// Fetch user
	user, err := s.repo.GetUserByEmail(r.Context(), req.Email)
	if err != nil {
		s.errorJSON(w, "invalid credentials", http.StatusUnauthorized)
		return
	}

	// Verify password
	if err := bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(req.Password)); err != nil {
		s.errorJSON(w, "invalid credentials", http.StatusUnauthorized)
		return
	}

	token := s.createToken(user.ID)
	s.responseJSON(w, map[string]any{
		"token":   token,
		"user_id": user.ID,
	}, http.StatusOK)
}
