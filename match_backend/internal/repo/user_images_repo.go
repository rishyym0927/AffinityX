package repo

import (
	"context"
)


// ---------------------------
// User Images
// ---------------------------		


func (p *Postgres) AddUserImage(ctx context.Context, userID int64, url string) error {
	_, err := p.Pool.Exec(ctx,
		`INSERT INTO user_images (user_id, image_url) VALUES ($1, $2);`,
		userID, url)
	return err
}

func (p *Postgres) GetUserImages(ctx context.Context, userID int64) ([]string, error) {
	rows, err := p.Pool.Query(ctx, `SELECT image_url FROM user_images WHERE user_id=$1 ORDER BY uploaded_at DESC;`, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var urls []string
	for rows.Next() {
		var u string
		if err := rows.Scan(&u); err != nil {
			return nil, err
		}
		urls = append(urls, u)
	}
	return urls, rows.Err()
}

func (p *Postgres) DeleteUserImage(ctx context.Context, imageID, userID int64) error {
	_, err := p.Pool.Exec(ctx, `DELETE FROM user_images WHERE id=$1 AND user_id=$2;`, imageID, userID)
	return err
}

func (p *Postgres) SetPrimaryImage(ctx context.Context, imageID, userID int64) error {
	tx, err := p.Pool.Begin(ctx)
	if err != nil {
		return err
	}
	defer tx.Rollback(ctx)

	_, err = tx.Exec(ctx, `UPDATE user_images SET is_primary=FALSE WHERE user_id=$1;`, userID)
	if err != nil {
		return err
	}
	_, err = tx.Exec(ctx, `UPDATE user_images SET is_primary=TRUE WHERE id=$1 AND user_id=$2;`, imageID, userID)
	if err != nil {
		return err
	}

	return tx.Commit(ctx)
}
