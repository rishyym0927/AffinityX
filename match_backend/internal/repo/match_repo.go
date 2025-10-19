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
