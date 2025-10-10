package repo

import "context"

// Upsert chatbot scores
func (p *Postgres) UpsertScores(ctx context.Context, userID int64, personality, communication, emotional, confidence, total int) error {
	q := `
	INSERT INTO scores (user_id, personality, communication, emotional, confidence, total_score)
	VALUES ($1,$2,$3,$4,$5,$6)
	ON CONFLICT (user_id) DO UPDATE
	SET personality=$2, communication=$3, emotional=$4, confidence=$5, total_score=$6;
	`
	_, err := p.Pool.Exec(ctx, q, userID, personality, communication, emotional, confidence, total)
	return err
}
