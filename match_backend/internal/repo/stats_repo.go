package repo

import (
	"context"
	"time"
)

// UserActivityStats represents activity statistics for a user
type UserActivityStats struct {
	Likes        int `json:"likes"`
	Matches      int `json:"matches"`
	ProfileViews int `json:"profile_views"`
}

// WeeklyActivityData represents daily activity for a week
type WeeklyActivityData struct {
	Day     string `json:"day"`
	Likes   int    `json:"likes"`
	Matches int    `json:"matches"`
}

// RequestStatistics represents statistics about match requests
type RequestStatistics struct {
	TotalRequests  int     `json:"total_requests"`
	Accepted       int     `json:"accepted"`
	Rejected       int     `json:"rejected"`
	Pending        int     `json:"pending"`
	ThisWeek       int     `json:"this_week"`
	AcceptanceRate float64 `json:"acceptance_rate"`
}

// ProfileAnalytics represents comprehensive profile analytics
type ProfileAnalytics struct {
	Communication int     `json:"communication"`
	Confidence    int     `json:"confidence"`
	Emotional     int     `json:"emotional"`
	Personality   int     `json:"personality"`
	TotalScore    int     `json:"total_score"`
	ProfileRating float64 `json:"profile_rating"`
}

// GetUserActivityStats retrieves activity statistics for a user
func (p *Postgres) GetUserActivityStats(ctx context.Context, userID int64) (UserActivityStats, error) {
	var stats UserActivityStats

	query := `
		SELECT 
			COALESCE(
				(SELECT COUNT(*) FROM match_requests WHERE sender_id = $1), 
				0
			) AS likes,
			COALESCE(
				(SELECT COUNT(*) FROM matches WHERE user1_id = $1 OR user2_id = $1), 
				0
			) AS matches,
			COALESCE(
				(SELECT COUNT(*) FROM match_requests WHERE receiver_id = $1), 
				0
			) AS profile_views
	`

	err := p.Pool.QueryRow(ctx, query, userID).Scan(
		&stats.Likes,
		&stats.Matches,
		&stats.ProfileViews,
	)

	return stats, err
}

// GetWeeklyActivity retrieves weekly activity data for the past 7 days
func (p *Postgres) GetWeeklyActivity(ctx context.Context, userID int64) ([]WeeklyActivityData, error) {
	var weeklyData []WeeklyActivityData

	query := `
		WITH date_series AS (
			SELECT generate_series(
				CURRENT_DATE - INTERVAL '6 days',
				CURRENT_DATE,
				INTERVAL '1 day'
			)::date AS day
		),
		daily_likes AS (
			SELECT 
				DATE(created_at) AS day,
				COUNT(*) AS likes
			FROM match_requests
			WHERE sender_id = $1
			  AND created_at >= CURRENT_DATE - INTERVAL '6 days'
			GROUP BY DATE(created_at)
		),
		daily_matches AS (
			SELECT 
				DATE(matched_at) AS day,
				COUNT(*) AS matches
			FROM matches
			WHERE (user1_id = $1 OR user2_id = $1)
			  AND matched_at >= CURRENT_DATE - INTERVAL '6 days'
			GROUP BY DATE(matched_at)
		)
		SELECT 
			TO_CHAR(ds.day, 'Dy') AS day_name,
			COALESCE(dl.likes, 0) AS likes,
			COALESCE(dm.matches, 0) AS matches
		FROM date_series ds
		LEFT JOIN daily_likes dl ON ds.day = dl.day
		LEFT JOIN daily_matches dm ON ds.day = dm.day
		ORDER BY ds.day
	`

	rows, err := p.Pool.Query(ctx, query, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	for rows.Next() {
		var data WeeklyActivityData
		if err := rows.Scan(&data.Day, &data.Likes, &data.Matches); err != nil {
			return nil, err
		}
		weeklyData = append(weeklyData, data)
	}

	return weeklyData, rows.Err()
}

// GetRequestStatistics retrieves comprehensive match request statistics
func (p *Postgres) GetRequestStatistics(ctx context.Context, userID int64) (RequestStatistics, error) {
	var stats RequestStatistics

	query := `
		SELECT 
			COALESCE(COUNT(*), 0) AS total_requests,
			COALESCE(SUM(CASE WHEN status = 'accepted' THEN 1 ELSE 0 END), 0) AS accepted,
			COALESCE(SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END), 0) AS rejected,
			COALESCE(SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END), 0) AS pending,
			COALESCE(
				SUM(CASE WHEN created_at >= $2 THEN 1 ELSE 0 END), 
				0
			) AS this_week
		FROM match_requests
		WHERE receiver_id = $1
	`

	// Calculate one week ago
	oneWeekAgo := time.Now().AddDate(0, 0, -7)

	err := p.Pool.QueryRow(ctx, query, userID, oneWeekAgo).Scan(
		&stats.TotalRequests,
		&stats.Accepted,
		&stats.Rejected,
		&stats.Pending,
		&stats.ThisWeek,
	)

	if err != nil {
		return stats, err
	}

	// Calculate acceptance rate
	if stats.TotalRequests > 0 {
		stats.AcceptanceRate = float64(stats.Accepted) / float64(stats.TotalRequests) * 100
	}

	return stats, nil
}

// GetProfileAnalytics retrieves comprehensive profile analytics
func (p *Postgres) GetProfileAnalytics(ctx context.Context, userID int64) (ProfileAnalytics, error) {
	var analytics ProfileAnalytics

	query := `
		SELECT 
			COALESCE(s.communication, 0) AS communication,
			COALESCE(s.confidence, 0) AS confidence,
			COALESCE(s.emotional, 0) AS emotional,
			COALESCE(s.personality, 0) AS personality,
			COALESCE(s.total_score, 0) AS total_score
		FROM scores s
		WHERE s.user_id = $1
	`

	err := p.Pool.QueryRow(ctx, query, userID).Scan(
		&analytics.Communication,
		&analytics.Confidence,
		&analytics.Emotional,
		&analytics.Personality,
		&analytics.TotalScore,
	)

	if err != nil {
		return analytics, err
	}

	// Calculate profile rating (out of 5 stars based on total score out of 100)
	if analytics.TotalScore > 0 {
		analytics.ProfileRating = float64(analytics.TotalScore) / 20.0 // Convert 0-100 to 0-5
	} else {
		analytics.ProfileRating = 3.0 // Default rating
	}

	return analytics, nil
}

// GetIncomingRequestsCount returns the count of pending incoming requests
func (p *Postgres) GetIncomingRequestsCount(ctx context.Context, userID int64) (int, error) {
	var count int

	query := `
		SELECT COUNT(*) 
		FROM match_requests 
		WHERE receiver_id = $1 AND status = 'pending'
	`

	err := p.Pool.QueryRow(ctx, query, userID).Scan(&count)
	return count, err
}

// GetOutgoingRequestsCount returns the count of sent match requests
func (p *Postgres) GetOutgoingRequestsCount(ctx context.Context, userID int64) (int, error) {
	var count int

	query := `
		SELECT COUNT(*) 
		FROM match_requests 
		WHERE sender_id = $1 AND status = 'pending'
	`

	err := p.Pool.QueryRow(ctx, query, userID).Scan(&count)
	return count, err
}
