package api

import (
	"encoding/json"
	"net/http"
)

// submitScore handles chatbot score submission
func (s *Server) submitScore(w http.ResponseWriter, r *http.Request) {
	uid := userIDFromCtx(r)

	var sc ScoreSubmission
	if err := json.NewDecoder(r.Body).Decode(&sc); err != nil {
		s.errorJSON(w, "invalid request body", http.StatusBadRequest)
		return
	}

	// Validate scores
	if err := s.validateScores(&sc); err != nil {
		s.errorJSON(w, err.Error(), http.StatusBadRequest)
		return
	}

	// Calculate total score
	total := (sc.Personality + sc.Communication + sc.Emotional + sc.Confidence) / 4

	// Update scores in database
	err := s.repo.UpsertScores(r.Context(), uid, sc.Personality, sc.Communication, sc.Emotional, sc.Confidence, total)
	if err != nil {
		s.errorJSON(w, "failed to update scores", http.StatusInternalServerError)
		return
	}

	s.responseJSON(w, map[string]any{
		"message":     "score updated",
		"total_score": total,
	}, http.StatusOK)
}
