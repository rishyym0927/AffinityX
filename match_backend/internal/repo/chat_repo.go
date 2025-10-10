package repo

import (
	"context"
	"time"
)

type MessageRow struct {
	ID int64
	MatchID int64
	SenderID int64
	Body string
	SentAt time.Time
}

func (p *Postgres) InsertMessage(ctx context.Context, matchID, senderID int64, body string) (int64, error) {
	var id int64
	q := `INSERT INTO messages (match_id, sender_id, body) VALUES ($1,$2,$3) RETURNING id;`
	err := p.Pool.QueryRow(ctx, q, matchID, senderID, body).Scan(&id)
	return id, err
}

func (p *Postgres) GetMessages(ctx context.Context, matchID int64, limit int) ([]MessageRow, error) {
	if limit <= 0 || limit > 200 { limit = 100 }
	q := `SELECT id, match_id, sender_id, body, sent_at 
	      FROM messages WHERE match_id=$1 ORDER BY sent_at ASC LIMIT $2;`
	rows, err := p.Pool.Query(ctx, q, matchID, limit)
	if err != nil { return nil, err }
	defer rows.Close()

	out := []MessageRow{}
	for rows.Next() {
		var m MessageRow
		if err := rows.Scan(&m.ID, &m.MatchID, &m.SenderID, &m.Body, &m.SentAt); err != nil {
			return nil, err
		}
		out = append(out, m)
	}
	return out, rows.Err()
}
