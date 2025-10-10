package repo

import (
	"context"
)

type SignupInput struct {
	Name, Email, PasswordHash, Gender string
	Age int
	City string
}

func (p *Postgres) CreateUser(ctx context.Context, in SignupInput) (int64, error) {
	q := `
	INSERT INTO users (name, email, password_hash, gender, age, city)
	VALUES ($1,$2,$3,$4,$5,$6)
	RETURNING user_id;
	`
	var id int64
	err := p.Pool.QueryRow(ctx, q, in.Name, in.Email, in.PasswordHash, in.Gender, in.Age, in.City).Scan(&id)
	return id, err
}

type UserLoginRow struct {
	ID int64
	Email string
	PasswordHash string
}

func (p *Postgres) GetUserByEmail(ctx context.Context, email string) (UserLoginRow, error) {
	q := `SELECT user_id, email, password_hash FROM users WHERE email=$1;`
	var u UserLoginRow
	err := p.Pool.QueryRow(ctx, q, email).Scan(&u.ID, &u.Email, &u.PasswordHash)
	return u, err
}
