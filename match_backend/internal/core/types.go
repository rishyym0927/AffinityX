package core

// User holds data for one user
type User struct {
	ID            int64
	Name          string
	Gender        string   // 'M' or 'F'
	Age           int
	City          string
	Lat, Lon      float64
	TotalScore    int
	Personality   int
	Communication int
	Emotional     int
	Confidence    int
}

// MatchPrefs stores filters and preferences
type MatchPrefs struct {
	TargetGender rune
	AgeMin       int
	AgeMax       int
	MinScore     int
	CursorID     int64 // for pagination
	Limit        int
}

// Candidate wraps a user with a calculated score
type Candidate struct {
	User     User
	Score    float64
	Reasons  []string
}

// Recommendation is the final response
type Recommendation struct {
	Candidates []Candidate `json:"candidates"`
	NextCursor int64       `json:"next_cursor"`
}
