package api

import (
	"encoding/json"
	"net/http"
)

// matchRecommendations returns match recommendations based on preferences
func (s *Server) matchRecommendations(w http.ResponseWriter, r *http.Request) {
	// Parse query parameters
	prefs := s.parseMatchPreferences(r)

	// Fetch candidates
	users, nextCursor, err := s.repo.FetchCandidates(r.Context(), prefs)
	if err != nil {
		s.errorJSON(w, "failed to fetch recommendations", http.StatusInternalServerError)
		return
	}

	s.responseJSON(w, map[string]any{
		"candidates":  users,
		"next_cursor": nextCursor,
	}, http.StatusOK)
}

// matchRequest sends a match request to another user
func (s *Server) matchRequest(w http.ResponseWriter, r *http.Request) {
	var req MatchRequestPayload
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		s.errorJSON(w, "invalid request body", http.StatusBadRequest)
		return
	}

	// Validate receiver ID
	if req.ReceiverID <= 0 {
		s.errorJSON(w, "invalid receiver_id", http.StatusBadRequest)
		return
	}

	sender := userIDFromCtx(r)

	// Prevent self-matching
	if sender == req.ReceiverID {
		s.errorJSON(w, "cannot send request to yourself", http.StatusBadRequest)
		return
	}

	// Send match request
	if err := s.repo.SendMatchRequest(r.Context(), sender, req.ReceiverID); err != nil {
		s.errorJSON(w, "failed to send match request", http.StatusInternalServerError)
		return
	}

	s.responseJSON(w, map[string]string{"message": "request sent"}, http.StatusOK)
}

// matchRespond handles accepting or rejecting a match request
func (s *Server) matchRespond(w http.ResponseWriter, r *http.Request) {
	var req MatchResponsePayload
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		s.errorJSON(w, "invalid request body", http.StatusBadRequest)
		return
	}

	// Validate sender ID
	if req.SenderID <= 0 {
		s.errorJSON(w, "invalid sender_id", http.StatusBadRequest)
		return
	}

	receiver := userIDFromCtx(r)

	// Respond to match request
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

// getIncomingRequests retrieves all incoming match requests for a user
func (s *Server) getIncomingRequests(w http.ResponseWriter, r *http.Request) {
	uid := userIDFromCtx(r)

	requests, err := s.repo.GetIncomingMatchRequests(r.Context(), uid)
	if err != nil {
		s.errorJSON(w, "failed to fetch incoming requests", http.StatusInternalServerError)
		return
	}

	s.responseJSON(w, map[string]any{"requests": requests}, http.StatusOK)
}
