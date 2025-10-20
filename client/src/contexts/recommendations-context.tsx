'use client'

import React, { createContext, useContext, useEffect, useState, useCallback, useRef, type ReactNode } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { api } from '@/lib/api'
import { saveToCache, getFromCache, clearCache } from '@/lib/storage'

// Cache keys
const CACHE_KEYS = {
  RECOMMENDATIONS: 'recommendations_cache',
  FILTERS: 'recommendations_filters_cache',
}

// Types - Updated to match backend response format
export interface RecommendedUser {
  id: number
  name: string
  age: number
  city: string
  gender: 'M' | 'F'
  lat?: number
  lon?: number
  total_score?: number
  personality?: number
  communication?: number
  emotional?: number
  confidence?: number
  images?: string[]
}

export interface Candidate {
  user: RecommendedUser
  score: number
  reasons: string[]
  match_score: number
}

export interface RecommendationsResponse {
  candidates: Candidate[]
  next_cursor?: number
}

export interface RecommendationFilters {
  gender?: 'M' | 'F'
  age_min?: number
  age_max?: number
  limit?: number
  min_score?: number
}

export interface RecommendationsState {
  recommendations: Candidate[]
  isLoading: boolean
  error: string | null
  hasMore: boolean
  currentFilters: RecommendationFilters
}

export interface RecommendationsContextType extends RecommendationsState {
  fetchRecommendations: (filters?: RecommendationFilters, append?: boolean) => Promise<void>
  refreshRecommendations: () => Promise<void>
  updateFilters: (filters: RecommendationFilters) => void
  clearError: () => void
  removeRecommendation: (userId: number) => void
  rejectUser: (userId: number) => Promise<void>
}

// Create context
const RecommendationsContext = createContext<RecommendationsContextType | undefined>(undefined)

// Custom hook to use recommendations context
export const useRecommendations = () => {
  const context = useContext(RecommendationsContext)
  if (context === undefined) {
    throw new Error('useRecommendations must be used within a RecommendationsProvider')
  }
  return context
}

// Provider props
interface RecommendationsProviderProps {
  children: ReactNode
}

// Default filters
const DEFAULT_FILTERS: RecommendationFilters = {
  limit: 10
}

export const RecommendationsProvider: React.FC<RecommendationsProviderProps> = ({ children }) => {
  const [recommendations, setRecommendations] = useState<Candidate[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(true)
  const [currentFilters, setCurrentFilters] = useState<RecommendationFilters>(DEFAULT_FILTERS)
  const [hasInitialized, setHasInitialized] = useState(false)
  const [isFetching, setIsFetching] = useState(false)
  const lastFetchTimeRef = useRef<number>(0)
  
  const { isAuthenticated, user } = useAuth()

  // Load cached data on mount
  useEffect(() => {
    if (typeof window !== 'undefined' && isAuthenticated) {
      const cachedRecommendations = getFromCache<Candidate[]>(CACHE_KEYS.RECOMMENDATIONS)
      const cachedFilters = getFromCache<RecommendationFilters>(CACHE_KEYS.FILTERS)
      
      if (cachedRecommendations && cachedRecommendations.length > 0) {
        console.log('Loaded recommendations from cache:', cachedRecommendations.length)
        setRecommendations(cachedRecommendations)
      }
      
      if (cachedFilters) {
        console.log('Loaded filters from cache:', cachedFilters)
        setCurrentFilters(cachedFilters)
      }
    }
  }, [isAuthenticated])

  // Helper to dedupe candidates by user id
  const dedupe = (existing: Candidate[], incoming: Candidate[]) => {
    const seen = new Set(existing.map((c) => c.user.id))
    const unique = incoming.filter((c) => !seen.has(c.user.id))
    return [...existing, ...unique]
  }

  // Fetch recommendations function
  const fetchRecommendations = useCallback(async (
    filters: RecommendationFilters = currentFilters,
    append: boolean = false
  ): Promise<void> => {
    if (!isAuthenticated) {
      setError('User not authenticated')
      return
    }

    // Prevent concurrent fetches
    if (isFetching) {
      console.log('Already fetching, skipping duplicate request')
      return
    }

    // Prevent rapid successive calls (debounce at function level)
    const now = Date.now()
    if (now - lastFetchTimeRef.current < 500) {
      console.log('Fetch called too soon after previous, skipping')
      return
    }
    lastFetchTimeRef.current = now

    try {
      setIsFetching(true)
      setIsLoading(true)
      setError(null)
      
      console.log('Fetching recommendations with filters:', filters)
      const response = await api.getRecommendations(filters) as any
      console.log('Fetched recommendations:', response)
      
      if (response.error) {
        throw new Error(response.error)
      }

      if (response.data) {
        const newCandidates: Candidate[] = response.data.candidates || []
        
        if (append) {
          const merged = dedupe(recommendations, newCandidates)
          setRecommendations(merged)
          // Cache the merged results
          saveToCache(CACHE_KEYS.RECOMMENDATIONS, merged, 5 * 60 * 1000) // 5 minutes
        } else {
          setRecommendations(newCandidates)
          // Cache the new results
          saveToCache(CACHE_KEYS.RECOMMENDATIONS, newCandidates, 5 * 60 * 1000)
        }
        
        // Update hasMore based on the number of results returned
        const limit = filters.limit || DEFAULT_FILTERS.limit || 10
        // If we got fewer results than requested, there are no more profiles
        setHasMore(newCandidates.length >= limit)
        
        // Update current filters only on successful fetch
        setCurrentFilters(filters)
        saveToCache(CACHE_KEYS.FILTERS, filters, 5 * 60 * 1000)
        
        // Clear any previous errors on success
        setError(null)
      } else {
        // Handle empty response
        if (!append) {
          setRecommendations([])
        }
        setHasMore(false)
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch recommendations'
      setError(errorMessage)
      console.error('Error fetching recommendations:', err)
      
      // Don't clear existing recommendations on error if appending
      if (!append) {
        setRecommendations([])
      }
    } finally {
      setIsLoading(false)
      setIsFetching(false)
    }
  }, [isAuthenticated, currentFilters, isFetching])

  // Refresh recommendations with current filters
  const refreshRecommendations = useCallback(async (): Promise<void> => {
    await fetchRecommendations(currentFilters, false)
  }, [fetchRecommendations, currentFilters])

  // Update filters and fetch new recommendations
  const updateFilters = useCallback((newFilters: RecommendationFilters) => {
    const mergedFilters = { ...currentFilters, ...newFilters }
    setCurrentFilters(mergedFilters)
    setHasInitialized(true) // Mark as user-initiated
    fetchRecommendations(mergedFilters, false)
  }, [currentFilters, fetchRecommendations])

  // Clear error
  const clearError = useCallback(() => {
    setError(null)
  }, [])

  // Remove a recommendation (useful when user interacts with a recommendation)
  const removeRecommendation = useCallback((userId: number) => {
    setRecommendations(prev => {
      const filtered = prev.filter(c => c.user.id !== userId)
      // Update cache
      saveToCache(CACHE_KEYS.RECOMMENDATIONS, filtered, 5 * 60 * 1000)
      // If we've removed profiles and are running low, mark hasMore as uncertain
      // The dashboard will trigger a refetch if needed
      if (filtered.length === 0) {
        setHasMore(false)
      }
      return filtered
    })
  }, [])

  // Reject a user (swipe left) and notify backend
  const rejectUser = useCallback(async (userId: number) => {
    try {
      const { error } = await api.rejectUser(userId)
      if (error) {
        console.warn('Failed to notify backend of rejection:', error)
      }
    } catch (e) {
      console.warn('Error calling reject API', e)
    } finally {
      // Always remove locally so user experience is immediate
      removeRecommendation(userId)
    }
  }, [removeRecommendation])

  // Set default filters based on user preferences and auto-fetch (only once)
  useEffect(() => {
    // Only run once when user is authenticated and we haven't initialized yet
    if (!isAuthenticated || !user || hasInitialized) return

    const initializeRecommendations = async () => {
      const userBasedFilters: RecommendationFilters = {
        ...DEFAULT_FILTERS,
        // Set opposite gender by default
        gender: user.gender === 'M' ? 'F' : user.gender === 'F' ? 'M' : undefined,
        // Set age range based on user's age (if available)
        age_min: user.age ? Math.max(18, user.age - 5) : undefined,
        age_max: user.age ? user.age + 10 : undefined,
      }
      
      setCurrentFilters(userBasedFilters)
      setHasInitialized(true)
      
      // Fetch initial recommendations immediately
      await fetchRecommendations(userBasedFilters, false)
    }

    initializeRecommendations()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, isAuthenticated, hasInitialized])

  const value: RecommendationsContextType = {
    // State
    recommendations,
    isLoading,
    error,
    hasMore,
    currentFilters,
    // Actions
    fetchRecommendations,
    refreshRecommendations,
    updateFilters,
    clearError,
    removeRecommendation,
    rejectUser,
  }

  return (
    <RecommendationsContext.Provider value={value}>
      {children}
    </RecommendationsContext.Provider>
  )
}


