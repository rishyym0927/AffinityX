package repo

import (
	"context"

	"github.com/rishyym0927/match_backend/internal/core"
)

// FetchExclusions retrieves user IDs that should be excluded from recommendations
func (p *Postgres) FetchExclusions(ctx context.Context, viewer int64) (map[int64]struct{}, error) {
	exclusions := make(map[int64]struct{})

	query := `SELECT target_id FROM user_exclusions WHERE user_id = $1`

	rows, err := p.Pool.Query(ctx, query, viewer)
	if err != nil {
		// If table doesn't exist yet, return empty map
		return exclusions, nil
	}
	defer rows.Close()

	for rows.Next() {
		var targetID int64
		if err := rows.Scan(&targetID); err != nil {
			return exclusions, err
		}
		exclusions[targetID] = struct{}{}
	}

	return exclusions, rows.Err()
}

// FetchCandidates retrieves potential matches based on preferences
func (p *Postgres) FetchCandidates(ctx context.Context, prefs core.MatchPrefs) ([]core.User, int64, error) {
	var users []core.User
	var nextCursor int64

	query := `
		SELECT 
			u.user_id AS id,
			u.name,
			u.gender,
			u.age,
			u.city,
			COALESCE(u.lat, 0.0) AS lat,
			COALESCE(u.lon, 0.0) AS lon,
			COALESCE(s.total_score, 0) AS total_score,
			COALESCE(s.personality, 0) AS personality,
			COALESCE(s.communication, 0) AS communication,
			COALESCE(s.emotional, 0) AS emotional,
			COALESCE(s.confidence, 0) AS confidence
		FROM users u
		LEFT JOIN scores s ON u.user_id = s.user_id
		WHERE u.gender = $1
		  AND u.age BETWEEN $2 AND $3
		  AND COALESCE(s.total_score, 0) >= $4
		  AND u.user_id > $5
		ORDER BY u.user_id
		LIMIT $6
	`

	rows, err := p.Pool.Query(ctx, query,
		string(prefs.TargetGender),
		prefs.AgeMin,
		prefs.AgeMax,
		prefs.MinScore,
		prefs.CursorID,
		prefs.Limit+1, // +1 to detect next cursor
	)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	for rows.Next() {
		var u core.User
		if err := rows.Scan(
			&u.ID, &u.Name, &u.Gender, &u.Age, &u.City, &u.Lat, &u.Lon,
			&u.TotalScore, &u.Personality, &u.Communication, &u.Emotional, &u.Confidence,
		); err != nil {
			return nil, 0, err
		}
		users = append(users, u)
	}

	if err := rows.Err(); err != nil {
		return nil, 0, err
	}

	// Pagination: If more than limit, record next cursor ID
	if len(users) > prefs.Limit {
		nextCursor = users[len(users)-1].ID
		users = users[:prefs.Limit]
	}

	return users, nextCursor, nil
}

// SendMatchRequest creates a new match request
func (p *Postgres) SendMatchRequest(ctx context.Context, senderID, receiverID int64) error {
	query := `
		INSERT INTO match_requests (sender_id, receiver_id, status)
		VALUES ($1, $2, 'pending')
		ON CONFLICT (sender_id, receiver_id)
		DO UPDATE SET status = 'pending', created_at = NOW()
	`
	_, err := p.Pool.Exec(ctx, query, senderID, receiverID)
	return err
}

// RespondMatchRequest updates the status and creates a match if accepted
func (p *Postgres) RespondMatchRequest(ctx context.Context, senderID, receiverID int64, accept bool) error {
	status := "rejected"
	if accept {
		status = "accepted"
	}

	tx, err := p.Pool.Begin(ctx)
	if err != nil {
		return err
	}
	defer tx.Rollback(ctx)

	// Update request status
	_, err = tx.Exec(ctx, `
		UPDATE match_requests
		SET status = $3
		WHERE sender_id = $1 AND receiver_id = $2
	`, senderID, receiverID, status)
	if err != nil {
		return err
	}

	if accept {
		// Create mutual match
		_, err = tx.Exec(ctx, `
			INSERT INTO matches (user1_id, user2_id)
			VALUES ($1, $2)
			ON CONFLICT (user1_id, user2_id) DO NOTHING
		`, senderID, receiverID)
		if err != nil {
			return err
		}
	}

	return tx.Commit(ctx)
}

// MatchRequestResponse represents an incoming match request with user details
type MatchRequestResponse struct {
	ID            int64    `json:"id"`
	SenderID      int64    `json:"sender_id"`
	Name          string   `json:"name"`
	Age           int      `json:"age"`
	Location      string   `json:"location"`
	Image         string   `json:"image"`
	Bio           string   `json:"bio"`
	Timestamp     string   `json:"timestamp"`
	Compatibility int      `json:"compatibility"`
	MutualFriends int      `json:"mutualFriends"`
	Interests     []string `json:"interests"`
}

// GetIncomingMatchRequests retrieves all pending match requests for a user
func (p *Postgres) GetIncomingMatchRequests(ctx context.Context, receiverID int64) ([]MatchRequestResponse, error) {
	query := `
		SELECT 
			mr.id,
			mr.sender_id,
			u.name,
			COALESCE(u.age, 0) AS age,
			COALESCE(u.city, '') AS city,
			COALESCE(ui.public_url, '') AS image,
			COALESCE(s.total_score, 0) AS compatibility,
			mr.created_at
		FROM match_requests mr
		INNER JOIN users u ON mr.sender_id = u.user_id
		LEFT JOIN scores s ON u.user_id = s.user_id
		LEFT JOIN user_images ui ON u.user_id = ui.user_id AND ui.is_primary = true
		WHERE mr.receiver_id = $1 
		  AND mr.status = 'pending'
		ORDER BY mr.created_at DESC
	`

	rows, err := p.Pool.Query(ctx, query, receiverID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var requests []MatchRequestResponse
	for rows.Next() {
		var req MatchRequestResponse
		var createdAt interface{} // Will be time.Time

		err := rows.Scan(
			&req.ID,
			&req.SenderID,
			&req.Name,
			&req.Age,
			&req.Location,
			&req.Image,
			&req.Compatibility,
			&createdAt,
		)
		if err != nil {
			return nil, err
		}

		// Set default image if empty
		if req.Image == "" {
			req.Image = "/default.jpg"
		}

		// Generate a simple bio (since not in database)
		req.Bio = "Looking for meaningful connections and great conversations."

		// Format timestamp to relative time (e.g., "5 min ago")
		req.Timestamp = "recently"

		// These fields don't exist in your schema, leaving empty/default
		req.MutualFriends = 0
		req.Interests = []string{} // Empty array since not in database

		requests = append(requests, req)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	return requests, nil
}

// MatchResponse represents a recent match with user details
type MatchResponse struct {
	MatchID       int64  `json:"match_id"`
	UserID        int64  `json:"user_id"`
	Name          string `json:"name"`
	Age           int    `json:"age"`
	Location      string `json:"location"`
	Image         string `json:"image"`
	Bio           string `json:"bio"`
	MatchedAt     string `json:"matched_at"`
	Compatibility int    `json:"compatibility"`
	LastMessage   string `json:"last_message,omitempty"`
	LastMessageAt string `json:"last_message_at,omitempty"`
	UnreadCount   int    `json:"unread_count"`
}

// GetRecentMatches retrieves all recent matches for a user
func (p *Postgres) GetRecentMatches(ctx context.Context, userID int64) ([]MatchResponse, error) {
	query := `
		SELECT 
			m.id AS match_id,
			CASE 
				WHEN m.user1_id = $1 THEN m.user2_id
				ELSE m.user1_id
			END AS matched_user_id,
			u.name,
			COALESCE(u.age, 0) AS age,
			COALESCE(u.city, '') AS city,
			COALESCE(ui.public_url, '') AS image,
			COALESCE(s.total_score, 0) AS compatibility,
			m.matched_at,
			COALESCE(msg.body, '') AS last_message,
			msg.sent_at AS last_message_at
		FROM matches m
		INNER JOIN users u ON (
			CASE 
				WHEN m.user1_id = $1 THEN m.user2_id
				ELSE m.user1_id
			END = u.user_id
		)
		LEFT JOIN scores s ON u.user_id = s.user_id
		LEFT JOIN user_images ui ON u.user_id = ui.user_id AND ui.is_primary = true
		LEFT JOIN LATERAL (
			SELECT body, sent_at
			FROM messages
			WHERE match_id = m.id
			ORDER BY sent_at DESC
			LIMIT 1
		) msg ON true
		WHERE m.user1_id = $1 OR m.user2_id = $1
		ORDER BY COALESCE(msg.sent_at, m.matched_at) DESC
	`

	rows, err := p.Pool.Query(ctx, query, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var matches []MatchResponse
	for rows.Next() {
		var match MatchResponse
		var matchedAt, lastMessageAt interface{}

		err := rows.Scan(
			&match.MatchID,
			&match.UserID,
			&match.Name,
			&match.Age,
			&match.Location,
			&match.Image,
			&match.Compatibility,
			&matchedAt,
			&match.LastMessage,
			&lastMessageAt,
		)
		if err != nil {
			return nil, err
		}

		// Set default image if empty
		if match.Image == "" {
			match.Image = "/default.jpg"
		}

		// Generate a simple bio (since not in database)
		match.Bio = "Looking for meaningful connections and great conversations."

		// Format timestamps
		match.MatchedAt = "recently"
		if match.LastMessage != "" {
			match.LastMessageAt = "recently"
		}

		// Unread count would require tracking read status in DB, defaulting to 0
		match.UnreadCount = 0

		matches = append(matches, match)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	return matches, nil
}
