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
			<-sem
			mu.Lock()
			results = append(results, Candidate{User: c, Score: s, Reasons: reasons})
			mu.Unlock()
		}()
	}
	wg.Wait()

	// Sort by score
	sort.Slice(results, func(i, j int) bool {
		return results[i].Score > results[j].Score
	})

	// Limit
	if len(results) > prefs.Limit && prefs.Limit > 0 {
		results = results[:prefs.Limit]
	}

	return Recommendation{Candidates: results, NextCursor: nextCursor}, nil
}


