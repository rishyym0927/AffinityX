package utils

import (
	"strings"
)

// CleanUTF8 removes null bytes and other problematic characters from text
func CleanUTF8(input string) string {
	// Remove null bytes (0x00) which cause UTF-8 encoding issues in PostgreSQL
	cleaned := strings.ReplaceAll(input, "\x00", "")

	// Remove other control characters that might cause issues (optional)
	// You can add more cleaning rules here if needed

	return cleaned
}

// ValidateTextInput ensures text doesn't contain problematic characters
func ValidateTextInput(input string) string {
	return CleanUTF8(strings.TrimSpace(input))
}

// CleanSignupInput cleans all text fields in signup data
func CleanSignupInput(name, email, city, gender string) (string, string, string, string) {
	return ValidateTextInput(name),
		ValidateTextInput(email),
		ValidateTextInput(city),
		ValidateTextInput(gender)
}
