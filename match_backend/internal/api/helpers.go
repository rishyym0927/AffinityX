package api

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"
	"time"

	"github.com/golang-jwt/jwt/v5"

	"github.com/rishyym0927/match_backend/internal/core"
)

// ==================== VALIDATION ====================

// validateSignupRequest validates signup request fields
func (s *Server) validateSignupRequest(req *AuthRequest) error {
	if req.Name == "" {
		return fmt.Errorf("name is required")
	}
	if req.Email == "" {
		return fmt.Errorf("email is required")
	}
	if req.Password == "" {
		return fmt.Errorf("password is required")
	}
	return nil
}

// validateScores validates score submission
func (s *Server) validateScores(sc *ScoreSubmission) error {
	if sc.Personality < minValidScore || sc.Personality > maxValidScore {
		return fmt.Errorf("personality score must be between %d and %d", minValidScore, maxValidScore)
	}
	if sc.Communication < minValidScore || sc.Communication > maxValidScore {
		return fmt.Errorf("communication score must be between %d and %d", minValidScore, maxValidScore)
	}
	if sc.Emotional < minValidScore || sc.Emotional > maxValidScore {
		return fmt.Errorf("emotional score must be between %d and %d", minValidScore, maxValidScore)
	}
	if sc.Confidence < minValidScore || sc.Confidence > maxValidScore {
		return fmt.Errorf("confidence score must be between %d and %d", minValidScore, maxValidScore)
	}
	return nil
}

// ==================== PARSING ====================

// parseMatchPreferences extracts match preferences from query parameters
func (s *Server) parseMatchPreferences(r *http.Request) core.MatchPrefs {
	gender := r.URL.Query().Get("gender")
	ageMin, _ := strconv.Atoi(r.URL.Query().Get("age_min"))
	ageMax, _ := strconv.Atoi(r.URL.Query().Get("age_max"))
	limit, _ := strconv.Atoi(r.URL.Query().Get("limit"))
	minScoreStr := r.URL.Query().Get("min_score")

	// Apply default/max limits
	if limit <= 0 || limit > maxLimit {
		limit = defaultLimit
	}

	var targetGender rune
	if gender != "" {
		targetGender = []rune(gender)[0]
	}

	// Only apply min_score filter if explicitly specified
	minScore := 0 // Default to 0 to show all profiles
	if minScoreStr != "" {
		if parsed, err := strconv.Atoi(minScoreStr); err == nil && parsed >= 0 && parsed <= 100 {
			minScore = parsed
		}
	}

	return core.MatchPrefs{
		TargetGender: targetGender,
		AgeMin:       ageMin,
		AgeMax:       ageMax,
		Limit:        limit,
		MinScore:     minScore,
	}
}

// ==================== JWT ====================

// createToken generates a JWT token for the user
func (s *Server) createToken(uid int64) string {
	claims := jwt.MapClaims{
		"user_id": uid,
		"exp":     time.Now().Add(time.Duration(s.cfg.JWTTTLHours) * time.Hour).Unix(),
		"iat":     time.Now().Unix(),
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	signed, err := token.SignedString(s.jwtSecret)
	if err != nil {
		fmt.Printf("JWT sign error: %v\n", err)
		return ""
	}

	return signed
}

// ==================== RESPONSE HELPERS ====================

// responseJSON writes a JSON response with the given status code
func (s *Server) responseJSON(w http.ResponseWriter, data any, statusCode int) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(statusCode)
	if err := json.NewEncoder(w).Encode(data); err != nil {
		fmt.Printf("JSON encode error: %v\n", err)
	}
}

// errorJSON writes a JSON error response with the given status code
func (s *Server) errorJSON(w http.ResponseWriter, message string, statusCode int) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(statusCode)
	if err := json.NewEncoder(w).Encode(map[string]string{"error": message}); err != nil {
		fmt.Printf("JSON encode error: %v\n", err)
	}
}
