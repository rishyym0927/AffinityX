package core

import (
	"context"
	"sort"
	"sync"
)

// UserRepo defines the DB operations Matcher needs
type UserRepo interface {
	GetUser(ctx context.Context, id int64) (User, error)
	FetchExclusions(ctx context.Context, viewer int64) (map[int64]struct{}, error)
	FetchCandidates(ctx context.Context, prefs MatchPrefs) ([]User, int64, error)
	SendMatchRequest(ctx context.Context, senderID, receiverID int64) error
	RespondMatchRequest(ctx context.Context, senderID, receiverID int64, accept bool) error
	GetUserImageURLs(ctx context.Context, userID int64) ([]string, error)
}

// Matcher orchestrates recommendation generation
type Matcher struct {
	repo UserRepo
}

func NewMatcher(r UserRepo) *Matcher {
	return &Matcher{repo: r}
}

// Recommend computes top matches for a user
func (m *Matcher) Recommend(ctx context.Context, viewerID int64, prefs MatchPrefs) (Recommendation, error) {
	viewer, err := m.repo.GetUser(ctx, viewerID)
	if err != nil {
		return Recommendation{}, err
	}

	exclusions, err := m.repo.FetchExclusions(ctx, viewerID)
	if err != nil {
		return Recommendation{}, err
	}

	candidatesRaw, nextCursor, err := m.repo.FetchCandidates(ctx, prefs)
	if err != nil {
		return Recommendation{}, err
	}

	// Parallel scoring
	var wg sync.WaitGroup
	sem := make(chan struct{}, 8) // limit concurrency
	var mu sync.Mutex
	var results []Candidate

	for _, c := range candidatesRaw {
		c := c
		if _, skip := exclusions[c.ID]; skip || c.ID == viewerID {
			continue
		}

		wg.Add(1)
		go func() {
			defer wg.Done()
			sem <- struct{}{}
			s, reasons := RuleScore(viewer, c, 0) // geo=0 for now

			// Fetch user images
			images, err := m.repo.GetUserImageURLs(ctx, c.ID)
			if err == nil && len(images) > 0 {
				c.Images = images
			}

			// Convert score to percentage (0-100)
			matchScore := int(s * 100 / 75) // Max score is 75, normalize to 100
			if matchScore > 100 {
				matchScore = 100
			}

			<-sem
			mu.Lock()
			results = append(results, Candidate{
				User:       c,
				Score:      s,
				Reasons:    reasons,
				MatchScore: matchScore,
			})
			mu.Unlock()
		}()
	}
	wg.Wait()

	// Sort by score (DESC) - best matches first
	sort.Slice(results, func(i, j int) bool {
		return results[i].Score > results[j].Score
	})

	// Limit
	if len(results) > prefs.Limit && prefs.Limit > 0 {
		results = results[:prefs.Limit]
	}

	return Recommendation{Candidates: results, NextCursor: nextCursor}, nil
}
