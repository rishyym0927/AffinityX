package api

import (
	"time"
	"errors"

	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
)

func hashPassword(pw string) (string, error) {
	b, err := bcrypt.GenerateFromPassword([]byte(pw), bcrypt.DefaultCost)
	return string(b), err
}

func checkPassword(hash, pw string) error {
	return bcrypt.CompareHashAndPassword([]byte(hash), []byte(pw))
}

func makeJWT(secret string, ttlHours int, userID int64) (string, error) {
	claims := jwt.MapClaims{
		"sub": userID,
		"exp": time.Now().Add(time.Duration(ttlHours) * time.Hour).Unix(),
		"iat": time.Now().Unix(),
	}
	t := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return t.SignedString([]byte(secret))
}

func parseJWT(secret, token string) (int64, error) {
	t, err := jwt.Parse(token, func(t *jwt.Token) (interface{}, error) {
		if _, ok := t.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, errors.New("bad signing method")
		}
		return []byte(secret), nil
	})
	if err != nil || !t.Valid { return 0, errors.New("invalid token") }

	if claims, ok := t.Claims.(jwt.MapClaims); ok {
		if sub, ok := claims["sub"].(float64); ok {
			return int64(sub), nil
		}
	}
	return 0, errors.New("no sub")
}
