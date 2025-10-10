package core

import "math"

// similarity01 returns a similarity score between 0–1
func similarity01(a, b int) float64 {
	diff := math.Abs(float64(a - b))
	return 1.0 - diff/100.0
}

// clamp01 ensures score stays between 0 and 1
func clamp01(x float64) float64 {
	if x < 0 {
		return 0
	}
	if x > 1 {
		return 1
	}
	return x
}

// RuleScore computes compatibility between viewer and candidate
func RuleScore(viewer, cand User, maxDistanceKm float64) (float64, []string) {
	score := 0.0
	reasons := []string{}

	// 1️⃣ Score difference in total_score
	diff := math.Abs(float64(viewer.TotalScore - cand.TotalScore))
	score += (1 - diff/100.0) * 35
	reasons = append(reasons, "total_score_proximity")

	// 2️⃣ Individual personality traits
	p := 0.0
	p += 0.3 * similarity01(viewer.Personality, cand.Personality)
	p += 0.3 * similarity01(viewer.Communication, cand.Communication)
	p += 0.2 * similarity01(viewer.Emotional, cand.Emotional)
	p += 0.2 * similarity01(viewer.Confidence, cand.Confidence)
	score += p * 40
	reasons = append(reasons, "traits_match")

	// 3️⃣ Optional: Geo-distance (future improvement)
	// We’ll ignore lat/lon for now

	return score, reasons
}
