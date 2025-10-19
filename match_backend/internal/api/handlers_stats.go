package api

import (
	"net/http"
)

// getUserStats retrieves comprehensive activity statistics for the authenticated user
func (s *Server) getUserStats(w http.ResponseWriter, r *http.Request) {
	userID := userIDFromCtx(r)

	stats, err := s.repo.GetUserActivityStats(r.Context(), userID)
	if err != nil {
		s.errorJSON(w, "failed to fetch user stats", http.StatusInternalServerError)
		return
	}

	s.responseJSON(w, map[string]any{
		"stats": stats,
	}, http.StatusOK)
}

// getWeeklyActivity retrieves weekly activity data for the authenticated user
func (s *Server) getWeeklyActivity(w http.ResponseWriter, r *http.Request) {
	userID := userIDFromCtx(r)

	weeklyData, err := s.repo.GetWeeklyActivity(r.Context(), userID)
	if err != nil {
		s.errorJSON(w, "failed to fetch weekly activity", http.StatusInternalServerError)
		return
	}

	s.responseJSON(w, map[string]any{
		"weekly_activity": weeklyData,
	}, http.StatusOK)
}

// getRequestStats retrieves match request statistics for the authenticated user
func (s *Server) getRequestStats(w http.ResponseWriter, r *http.Request) {
	userID := userIDFromCtx(r)

	stats, err := s.repo.GetRequestStatistics(r.Context(), userID)
	if err != nil {
		s.errorJSON(w, "failed to fetch request statistics", http.StatusInternalServerError)
		return
	}

	s.responseJSON(w, map[string]any{
		"request_stats": stats,
	}, http.StatusOK)
}

// getProfileAnalytics retrieves profile analytics for the authenticated user
func (s *Server) getProfileAnalytics(w http.ResponseWriter, r *http.Request) {
	userID := userIDFromCtx(r)

	analytics, err := s.repo.GetProfileAnalytics(r.Context(), userID)
	if err != nil {
		s.errorJSON(w, "failed to fetch profile analytics", http.StatusInternalServerError)
		return
	}

	s.responseJSON(w, map[string]any{
		"analytics": analytics,
	}, http.StatusOK)
}

// getDashboardStats retrieves comprehensive dashboard statistics (combines multiple stats)
func (s *Server) getDashboardStats(w http.ResponseWriter, r *http.Request) {
	userID := userIDFromCtx(r)

	// Fetch all stats concurrently (or sequentially for simplicity)
	activityStats, err := s.repo.GetUserActivityStats(r.Context(), userID)
	if err != nil {
		s.errorJSON(w, "failed to fetch activity stats", http.StatusInternalServerError)
		return
	}

	weeklyActivity, err := s.repo.GetWeeklyActivity(r.Context(), userID)
	if err != nil {
		s.errorJSON(w, "failed to fetch weekly activity", http.StatusInternalServerError)
		return
	}

	requestStats, err := s.repo.GetRequestStatistics(r.Context(), userID)
	if err != nil {
		s.errorJSON(w, "failed to fetch request stats", http.StatusInternalServerError)
		return
	}

	analytics, err := s.repo.GetProfileAnalytics(r.Context(), userID)
	if err != nil {
		s.errorJSON(w, "failed to fetch profile analytics", http.StatusInternalServerError)
		return
	}

	incomingCount, err := s.repo.GetIncomingRequestsCount(r.Context(), userID)
	if err != nil {
		incomingCount = 0 // Don't fail, just set to 0
	}

	outgoingCount, err := s.repo.GetOutgoingRequestsCount(r.Context(), userID)
	if err != nil {
		outgoingCount = 0 // Don't fail, just set to 0
	}

	// Combine all stats into a single response
	s.responseJSON(w, map[string]any{
		"activity_stats":    activityStats,
		"weekly_activity":   weeklyActivity,
		"request_stats":     requestStats,
		"profile_analytics": analytics,
		"incoming_requests": incomingCount,
		"outgoing_requests": outgoingCount,
	}, http.StatusOK)
}
