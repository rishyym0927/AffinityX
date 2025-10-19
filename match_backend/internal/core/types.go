package core

// User holds data for one user
type User struct {
	ID            int64    `json:"id"`
	Name          string   `json:"name"`
	Gender        string   `json:"gender"` // 'M' or 'F'
	Age           int      `json:"age"`
	City          string   `json:"city"`
	Lat, Lon      float64  `json:"lat,omitempty"`
	TotalScore    int      `json:"total_score"`
	Personality   int      `json:"personality"`
	Communication int      `json:"communication"`
	Emotional     int      `json:"emotional"`
	Confidence    int      `json:"confidence"`
	Images        []string `json:"images,omitempty"`
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
	User       User     `json:"user"`
	Score      float64  `json:"score"`
	Reasons    []string `json:"reasons"`
	MatchScore int      `json:"match_score"` // Percentage compatibility
}

// Recommendation is the final response
type Recommendation struct {
	Candidates []Candidate `json:"candidates"`
	NextCursor int64       `json:"next_cursor"`
}
