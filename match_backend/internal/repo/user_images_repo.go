package repo

import (
	"context"
	"time"
)

// ---------------------------
// User Images
// ---------------------------

type UserImage struct {
	ID         int64     `json:"id"`
	UserID     int64     `json:"user_id"`
	ImageURL   string    `json:"image_url"`
	IsPrimary  bool      `json:"is_primary"`
	UploadedAt time.Time `json:"uploaded_at"`
}

func (p *Postgres) AddUserImage(ctx context.Context, userID int64, url string) error {
	// Extract filename from URL for object_name
	objectName := url
	_, err := p.Pool.Exec(ctx,
		`INSERT INTO user_images (user_id, object_name, public_url) VALUES ($1, $2, $3);`,
		userID, objectName, url)
	return err
}

func (p *Postgres) GetUserImages(ctx context.Context, userID int64) ([]UserImage, error) {
	rows, err := p.Pool.Query(ctx,
		`SELECT id, user_id, COALESCE(public_url, ''), is_primary, uploaded_at 
		 FROM user_images 
		 WHERE user_id=$1 
		 ORDER BY is_primary DESC, uploaded_at DESC;`,
		userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var images []UserImage
	for rows.Next() {
		var img UserImage
		if err := rows.Scan(&img.ID, &img.UserID, &img.ImageURL, &img.IsPrimary, &img.UploadedAt); err != nil {
			return nil, err
		}
		images = append(images, img)
	}
	return images, rows.Err()
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
