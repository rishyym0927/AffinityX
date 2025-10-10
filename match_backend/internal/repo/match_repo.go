package repo



// func (p *Postgres) SendMatchRequest(ctx context.Context, senderID, receiverID int64) error {
// 	q := `INSERT INTO match_requests (sender_id, receiver_id, status)
// 	      VALUES ($1,$2,'pending')
// 	      ON CONFLICT (sender_id, receiver_id)
// 	      DO UPDATE SET status='pending', created_at=NOW();`
// 	_, err := p.Pool.Exec(ctx, q, senderID, receiverID)
// 	return err
// }

// func (p *Postgres) RespondMatchRequest(ctx context.Context, senderID, receiverID int64, accept bool) error {
// 	status := "rejected"
// 	if accept { status = "accepted" }

// 	tx, err := p.Pool.Begin(ctx); if err != nil { return err }
// 	defer tx.Rollback(ctx)

// 	_, err = tx.Exec(ctx, `UPDATE match_requests SET status=$3 WHERE sender_id=$1 AND receiver_id=$2;`,
// 		senderID, receiverID, status)
// 	if err != nil { return err }

// 	if accept {
// 		_, err = tx.Exec(ctx, `
// 			INSERT INTO matches (user1_id, user2_id)
// 			VALUES ($1,$2)
// 			ON CONFLICT (user1_id, user2_id) DO NOTHING;`, senderID, receiverID)
// 		if err != nil { return err }
// 	}
// 	return tx.Commit(ctx)
// }
