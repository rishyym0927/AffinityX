package repo

import (
	"context"
	"log"

	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/rishyym0927/match_backend/internal/core"
)

type Postgres struct {
	Pool *pgxpool.Pool
}

// NewPostgres connects to Postgres and returns a pool instance
func NewPostgres(ctx context.Context, dsn string) (*Postgres, error) {
	pool, err := pgxpool.New(ctx, dsn)
	if err != nil {
		return nil, err
	}

	// Try connecting to verify DSN is correct
	if err := pool.Ping(ctx); err != nil {
		return nil, err
	}

	log.Println("✅ Connected to PostgreSQL")
	return &Postgres{Pool: pool}, nil
}

// Close closes the DB pool when the app shuts down
func (p *Postgres) Close() {
	p.Pool.Close()
}

func (p *Postgres) GetUser(ctx context.Context, id int64) (core.User, error) {
	var u core.User

	// Explanation:
	// We join users + scores because we stored the trait scores separately.
	// Use column aliases so we can scan them into struct fields like ID.
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
		WHERE u.user_id = $1
	`

	err := p.Pool.QueryRow(ctx, query, id).Scan(
		&u.ID, &u.Name, &u.Gender, &u.Age, &u.City,
		&u.Lat, &u.Lon,
		&u.TotalScore, &u.Personality, &u.Communication, &u.Emotional, &u.Confidence,
	)

	return u, err
}
