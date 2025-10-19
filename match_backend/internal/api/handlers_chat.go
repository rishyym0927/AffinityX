package api

import (
	"encoding/json"
	"net/http"
	"strconv"

	"github.com/go-chi/chi/v5"
)

// chatSend sends a chat message in a match
func (s *Server) chatSend(w http.ResponseWriter, r *http.Request) {
	var req ChatSendPayload
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		s.errorJSON(w, "invalid request body", http.StatusBadRequest)
		return
	}

	// Validate payload
	if req.MatchID <= 0 || req.Message == "" {
		s.errorJSON(w, "match_id and message are required", http.StatusBadRequest)
		return
	}

	uid := userIDFromCtx(r)

	// Insert message
	if _, err := s.repo.InsertMessage(r.Context(), req.MatchID, uid, req.Message); err != nil {
		s.errorJSON(w, "failed to send message", http.StatusInternalServerError)
		return
	}

	s.responseJSON(w, map[string]string{"message": "sent"}, http.StatusOK)
}

// chatGet retrieves chat messages for a specific match
func (s *Server) chatGet(w http.ResponseWriter, r *http.Request) {
	matchID, err := strconv.ParseInt(chi.URLParam(r, "match_id"), 10, 64)
	if err != nil {
		s.errorJSON(w, "invalid match_id", http.StatusBadRequest)
		return
	}

	// Fetch messages
	msgs, err := s.repo.GetMessages(r.Context(), matchID, maxMessages)
	if err != nil {
		s.errorJSON(w, "failed to fetch messages", http.StatusInternalServerError)
		return
	}

	s.responseJSON(w, map[string]any{"messages": msgs}, http.StatusOK)
}
