package api

const (
	maxUploadSize   = 20 << 20 // 20 MB
	maxImagesUpload = 10
	defaultLimit    = 10
	maxLimit        = 50
	minValidScore   = 0
	maxValidScore   = 100
	defaultMinScore = 60
	maxMessages     = 100
)

// ==================== REQUEST TYPES ====================

// AuthRequest represents signup request payload
type AuthRequest struct {
	Name     string `json:"name"`
	Email    string `json:"email"`
	Password string `json:"password"`
	Gender   string `json:"gender"`
	Age      int    `json:"age"`
	City     string `json:"city"`
}

// LoginRequest represents login request payload
type LoginRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

// ScoreSubmission represents chatbot score submission
type ScoreSubmission struct {
	Personality   int `json:"personality"`
	Communication int `json:"communication"`
	Emotional     int `json:"emotional"`
	Confidence    int `json:"confidence"`
}

// MatchRequestPayload represents a match request
type MatchRequestPayload struct {
	ReceiverID int64 `json:"receiver_id"`
}

// MatchResponsePayload represents a match response
type MatchResponsePayload struct {
	SenderID int64 `json:"sender_id"`
	Accept   bool  `json:"accept"`
}

// ChatSendPayload represents a chat message to send
type ChatSendPayload struct {
	MatchID int64  `json:"match_id"`
	Message string `json:"message"`
}
