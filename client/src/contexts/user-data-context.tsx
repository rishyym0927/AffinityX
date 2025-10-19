'use client'

import React, { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { api } from '@/lib/api'

// Types
export interface UserProfile {
  ID: number
  Name: string
  Age: number
  City: string
  Gender: string
  Lat: number
  Lon: number
  Communication: number
  Confidence: number
  Emotional: number
  Personality: number
  TotalScore: number
}

export interface UserImage {
  id: number
  user_id: number
  image_url: string
  is_primary: boolean
  uploaded_at: string
}

export interface MatchRequest {
  id: number
  sender_id: number
  name: string
  age: number
  location: string
  image: string
  bio: string
  timestamp: string
  compatibility: number
  mutualFriends: number
  interests: string[]
}

export interface Match {
  match_id: number
  user_id: number
  name: string
  age: number
  location: string
  image: string
  bio: string
  matched_at: string
  compatibility: number
  last_message?: string
  last_message_at?: string
  unread_count: number
}

export interface ActivityStats {
  likes: number
  matches: number
  profile_views: number
  messages_sent: number
  messages_received: number
}

export interface RequestStatistics {
  total_requests: number
  pending: number
  accepted: number
  rejected: number
  this_week: number
  acceptance_rate: number
}

export interface DashboardStats {
  activity_stats?: ActivityStats
  request_stats?: RequestStatistics
  weekly_activity?: any[]
  analytics?: any
}

export interface UserDataState {
  profile: UserProfile | null
  images: UserImage[]
  matchRequests: MatchRequest[]
  matches: Match[]
  dashboardStats: DashboardStats | null
  requestStats: RequestStatistics | null
  isLoading: boolean
  isInitialized: boolean
  error: string | null
}

export interface UserDataContextType extends UserDataState {
  refreshProfile: () => Promise<void>
  refreshImages: () => Promise<void>
  refreshMatchRequests: () => Promise<void>
  refreshMatches: () => Promise<void>
  refreshDashboardStats: () => Promise<void>
  refreshRequestStats: () => Promise<void>
  refreshAll: () => Promise<void>
  clearError: () => void
  addImage: (image: UserImage) => void
  removeImage: (imageId: number) => void
  updateImage: (imageId: number, updates: Partial<UserImage>) => void
  removeMatchRequest: (senderId: number) => void
  removeMatch: (matchId: number) => void
}

// Create context
const UserDataContext = createContext<UserDataContextType | undefined>(undefined)

// Custom hook to use user data context
export const useUserData = () => {
  const context = useContext(UserDataContext)
  if (context === undefined) {
    throw new Error('useUserData must be used within a UserDataProvider')
  }
  return context
}

// Provider props
interface UserDataProviderProps {
  children: ReactNode
}

export const UserDataProvider: React.FC<UserDataProviderProps> = ({ children }) => {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [images, setImages] = useState<UserImage[]>([])
  const [matchRequests, setMatchRequests] = useState<MatchRequest[]>([])
  const [matches, setMatches] = useState<Match[]>([])
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null)
  const [requestStats, setRequestStats] = useState<RequestStatistics | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isInitialized, setIsInitialized] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const { isAuthenticated, user, isLoading: authLoading } = useAuth()

  // Fetch user profile
  const refreshProfile = useCallback(async () => {
    if (!isAuthenticated || !user?.id) return

    try {
      const response = await api.getProfile(parseInt(user.id))
      if (response.error) {
        console.error('Failed to fetch profile:', response.error)
      } else if (response.data) {
        setProfile(response.data)
      }
    } catch (err) {
      console.error('Error fetching profile:', err)
    }
  }, [isAuthenticated, user?.id])

  // Fetch user images
  const refreshImages = useCallback(async () => {
    if (!isAuthenticated || !user?.id) return

    try {
      const response = await api.listUserImages()
      if (response.error) {
        console.error('Failed to fetch images:', response.error)
      } else if (response.data?.images) {
        setImages(response.data.images)
      } else {
        setImages([])
      }
    } catch (err) {
      console.error('Error fetching images:', err)
    }
  }, [isAuthenticated, user?.id])

  // Fetch match requests
  const refreshMatchRequests = useCallback(async () => {
    if (!isAuthenticated) return

    try {
      const response = await api.getIncomingRequests()
      if (response.error) {
        console.error('Failed to fetch match requests:', response.error)
      } else if (response.data?.requests) {
        setMatchRequests(response.data.requests)
      } else {
        setMatchRequests([])
      }
    } catch (err) {
      console.error('Error fetching match requests:', err)
    }
  }, [isAuthenticated])

  // Fetch matches
  const refreshMatches = useCallback(async () => {
    if (!isAuthenticated) return

    try {
      const response = await api.getRecentMatches()
      if (response.error) {
        console.error('Failed to fetch matches:', response.error)
      } else if (response.data?.matches) {
        setMatches(response.data.matches)
      } else {
        setMatches([])
      }
    } catch (err) {
      console.error('Error fetching matches:', err)
    }
  }, [isAuthenticated])

  // Fetch dashboard stats
  const refreshDashboardStats = useCallback(async () => {
    if (!isAuthenticated) return

    try {
      const response = await api.getDashboardStats()
      if (response.error) {
        console.error('Failed to fetch dashboard stats:', response.error)
      } else if (response.data) {
        setDashboardStats(response.data)
      }
    } catch (err) {
      console.error('Error fetching dashboard stats:', err)
    }
  }, [isAuthenticated])

  // Fetch request stats
  const refreshRequestStats = useCallback(async () => {
    if (!isAuthenticated) return

    try {
      const response = await api.getRequestStats()
      if (response.error) {
        console.error('Failed to fetch request stats:', response.error)
      } else if (response.data?.request_stats) {
        setRequestStats(response.data.request_stats)
      }
    } catch (err) {
      console.error('Error fetching request stats:', err)
    }
  }, [isAuthenticated])

  // Refresh all data
  const refreshAll = useCallback(async () => {
    if (!isAuthenticated || authLoading) return

    setIsLoading(true)
    setError(null)

    try {
      // Fetch all data in parallel for better performance
      await Promise.all([
        refreshProfile(),
        refreshImages(),
        refreshMatchRequests(),
        refreshMatches(),
        refreshDashboardStats(),
        refreshRequestStats(),
      ])
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch user data'
      setError(errorMessage)
      console.error('Error refreshing all data:', err)
    } finally {
      setIsLoading(false)
      setIsInitialized(true)
    }
  }, [
    isAuthenticated,
    authLoading,
    refreshProfile,
    refreshImages,
    refreshMatchRequests,
    refreshMatches,
    refreshDashboardStats,
    refreshRequestStats,
  ])

  // Clear error
  const clearError = useCallback(() => {
    setError(null)
  }, [])

  // Local state management helpers
  const addImage = useCallback((image: UserImage) => {
    setImages(prev => [...prev, image])
  }, [])

  const removeImage = useCallback((imageId: number) => {
    setImages(prev => prev.filter(img => img.id !== imageId))
  }, [])

  const updateImage = useCallback((imageId: number, updates: Partial<UserImage>) => {
    setImages(prev => prev.map(img => 
      img.id === imageId ? { ...img, ...updates } : img
    ))
  }, [])

  const removeMatchRequest = useCallback((senderId: number) => {
    setMatchRequests(prev => prev.filter(req => req.sender_id !== senderId))
  }, [])

  const removeMatch = useCallback((matchId: number) => {
    setMatches(prev => prev.filter(match => match.match_id !== matchId))
  }, [])

  // Initialize data when auth is ready
  useEffect(() => {
    if (isAuthenticated && !authLoading && !isInitialized) {
      refreshAll()
    } else if (!isAuthenticated && !authLoading) {
      // Clear data if not authenticated
      setProfile(null)
      setImages([])
      setMatchRequests([])
      setMatches([])
      setDashboardStats(null)
      setRequestStats(null)
      setIsLoading(false)
      setIsInitialized(false)
    }
  }, [isAuthenticated, authLoading, isInitialized, refreshAll])

  const value: UserDataContextType = {
    // State
    profile,
    images,
    matchRequests,
    matches,
    dashboardStats,
    requestStats,
    isLoading,
    isInitialized,
    error,
    // Actions
    refreshProfile,
    refreshImages,
    refreshMatchRequests,
    refreshMatches,
    refreshDashboardStats,
    refreshRequestStats,
    refreshAll,
    clearError,
    addImage,
    removeImage,
    updateImage,
    removeMatchRequest,
    removeMatch,
  }

  return (
    <UserDataContext.Provider value={value}>
      {children}
    </UserDataContext.Provider>
  )
}
