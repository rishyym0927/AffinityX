package api

import (
	"net/http"
	"strings"
	"context"
	"fmt"

	"github.com/golang-jwt/jwt/v5"
)

type ctxKey string
const userIDKey ctxKey = "uid"

func (s *Server) AuthMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		authHeader := r.Header.Get("Authorization")
		if authHeader == "" || !strings.HasPrefix(authHeader, "Bearer ") {
			http.Error(w, "missing or invalid auth header", http.StatusUnauthorized)
			return
		}

		tokenStr := strings.TrimPrefix(authHeader, "Bearer ")
		token, err := jwt.Parse(tokenStr, func(token *jwt.Token) (interface{}, error) {
			if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
				return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
			}
			return s.jwtSecret, nil
		})

		if err != nil {
			fmt.Println("JWT parse error:", err)
			http.Error(w, "invalid token", http.StatusUnauthorized)
			return
		}

		if claims, ok := token.Claims.(jwt.MapClaims); ok && token.Valid {
			uidFloat, ok := claims["user_id"].(float64)
			if !ok {
				http.Error(w, "invalid claims", http.StatusUnauthorized)
				return
			}
			ctx := context.WithValue(r.Context(), "user_id", int64(uidFloat))
			next.ServeHTTP(w, r.WithContext(ctx))
		} else {
			http.Error(w, "invalid token", http.StatusUnauthorized)
		}
	})
}


func userIDFromCtx(r *http.Request) int64 {
	if v := r.Context().Value(userIDKey); v != nil {
		if id, ok := v.(int64); ok { return id }
	}
	return 0
}
