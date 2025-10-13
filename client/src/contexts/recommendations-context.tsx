'use client'

import React, { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { api } from '@/lib/api'

// Types - Updated to match backend response format
export interface RecommendedUser {
  ID: number
  Name: string
  Age: number
  City: string
  Gender: 'M' | 'F'
  Lat: number
  Lon: number
  TotalScore: number
  Personality: number
  Communication: number
  Emotional: number
  Confidence: number
}

export interface RecommendationsResponse {
  candidates: RecommendedUser[]
}

export interface RecommendationFilters {
  gender?: 'M' | 'F'
  age_min?: number
  age_max?: number
  limit?: number
}

export interface RecommendationsState {
  recommendations: RecommendedUser[]
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
  const [recommendations, setRecommendations] = useState<RecommendedUser[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(true)
  const [currentFilters, setCurrentFilters] = useState<RecommendationFilters>(DEFAULT_FILTERS)
  
  const { isAuthenticated, user } = useAuth()

  // Fetch recommendations function
  const fetchRecommendations = useCallback(async (
    filters: RecommendationFilters = currentFilters,
    append: boolean = false
  ): Promise<void> => {
    if (!isAuthenticated) {
      setError('User not authenticated')
      return
    }

    try {
      setIsLoading(true)
      setError(null)
      
      const response = await api.getRecommendations(filters)
      console.log('Fetched recommendations:', response)
      
      if (response.error) {
        throw new Error(response.error)
      }

      if (response.data) {
        const newRecommendations = response.data.candidates || []
        
        if (append) {
          setRecommendations(prev => {
            // Remove duplicates based on ID
            const existingIds = new Set(prev.map(user => user.ID))
            const uniqueNew = newRecommendations.filter((user: RecommendedUser) => !existingIds.has(user.ID))
            return [...prev, ...uniqueNew]
          })
        } else {
          setRecommendations(newRecommendations)
        }
        
        // Update hasMore based on the number of results returned
        const limit = filters.limit || DEFAULT_FILTERS.limit || 10
        setHasMore(newRecommendations.length >= limit)
        
        // Update current filters
        setCurrentFilters(filters)
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
    }
  }, [isAuthenticated, currentFilters])

  // Refresh recommendations with current filters
  const refreshRecommendations = useCallback(async (): Promise<void> => {
    await fetchRecommendations(currentFilters, false)
  }, [fetchRecommendations, currentFilters])

  // Update filters and fetch new recommendations
  const updateFilters = useCallback((newFilters: RecommendationFilters) => {
    const mergedFilters = { ...currentFilters, ...newFilters }
    setCurrentFilters(mergedFilters)
    fetchRecommendations(mergedFilters, false)
  }, [currentFilters, fetchRecommendations])

  // Clear error
  const clearError = useCallback(() => {
    setError(null)
  }, [])

  // Remove a recommendation (useful when user interacts with a recommendation)
  const removeRecommendation = useCallback((userId: number) => {
    setRecommendations(prev => prev.filter(user => user.ID !== userId))
  }, [])

  // Auto-fetch recommendations when user becomes authenticated
  useEffect(() => {
    if (isAuthenticated && recommendations.length === 0 && !isLoading) {
      fetchRecommendations()
    }
  }, [isAuthenticated, recommendations.length, isLoading, fetchRecommendations])

  // Set default filters based on user preferences
  useEffect(() => {
    if (user && isAuthenticated) {
      const userBasedFilters: RecommendationFilters = {
        ...DEFAULT_FILTERS,
        // Set opposite gender by default
        gender: user.gender === 'M' ? 'F' : user.gender === 'F' ? 'M' : undefined,
        // Set age range based on user's age (if available)
        age_min: user.age ? Math.max(18, user.age - 5) : undefined,
        age_max: user.age ? user.age + 10 : undefined,
      }
      
      setCurrentFilters(userBasedFilters)
    }
  }, [user, isAuthenticated])

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
  }

  return (
    <RecommendationsContext.Provider value={value}>
      {children}
    </RecommendationsContext.Provider>
  )
}


