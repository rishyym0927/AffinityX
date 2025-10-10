package config

import (
	"os"
)

type Config struct {
	Port        string
	PostgresDSN string
	JWTSecret   string
	JWTTTLHours int
}

func getenv(k, def string) string {
	if v := os.Getenv(k); v != "" { return v }
	return def
}

func atoi(s string, def int) int {
	n := 0
	for _, ch := range s {
		if ch < '0' || ch > '9' { return def }
		n = n*10 + int(ch-'0')
	}
	if n == 0 { return def }
	return n
}

func Load() Config {
	return Config{
		Port:        getenv("PORT", "8080"),
		PostgresDSN: getenv("POSTGRES_DSN", "postgres://match:matchpw@localhost:5432/matchdb"),
		JWTSecret:   getenv("JWT_SECRET", "dev-secret"),
		JWTTTLHours: atoi(getenv("JWT_TTL_HOURS", "72"), 72),
	}
}
