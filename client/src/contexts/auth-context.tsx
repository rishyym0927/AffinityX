'use client'

import React, { createContext, useContext, useEffect, useState, type ReactNode } from 'react'

// API Base URL - update this to match your backend
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'

// Types - Updated to match backend response
export interface User {
  id: string
  email: string
  name: string
  age?: number
  city?: string
  gender?: string
  lat?: number
  lon?: number
  communication?: number
  confidence?: number
  emotional?: number
  personality?: number
  totalScore?: number
  avatar?: string
  preferences?: {
    ageRange: [number, number]
    interests: string[]
    location: string
  }
}

// Backend user profile interface
interface BackendUserProfile {
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

export interface AuthState {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
}

export interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  logout: () => void
  signup: (userData: SignupData) => Promise<{ success: boolean; error?: string }>
  updateUser: (userData: Partial<User>) => void
  refreshUserData: () => Promise<void>
}

export interface SignupData {
  name: string
  email: string
  password: string
  gender: string
  age: number
  city: string
}

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

// Auth Provider Component
interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Check if user is authenticated
  const isAuthenticated = !!user

  // Function to fetch user profile data from backend
  const fetchUserProfile = async (userId: string, token: string): Promise<User | null> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/user/profile/${userId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        console.error('Failed to fetch user profile:', response.statusText)
        return null
      }

      const profileData: BackendUserProfile = await response.json()
      
      // Convert backend response to User interface
      const user: User = {
        id: userId,
        email: localStorage.getItem('user_email') || '',
        name: profileData.Name,
        age: profileData.Age,
        city: profileData.City,
        gender: profileData.Gender,
        lat: profileData.Lat,
        lon: profileData.Lon,
        communication: profileData.Communication,
        confidence: profileData.Confidence,
        emotional: profileData.Emotional,
        personality: profileData.Personality,
        totalScore: profileData.TotalScore,
      }

      return user
    } catch (error) {
      console.error('Error fetching user profile:', error)
      return null
    }
  }

  // Initialize auth from localStorage
  useEffect(() => {
    const initAuth = async () => {
      try {
        const token = localStorage.getItem('auth_token')
        const userId = localStorage.getItem('user_id')
        const userEmail = localStorage.getItem('user_email')

        if (token && userId && userEmail) {
          // Try to fetch complete user profile from backend
          const fullUserProfile = await fetchUserProfile(userId, token)
          
          if (fullUserProfile) {
            setUser(fullUserProfile)
          } else {
            // Fallback to basic user info if profile fetch fails
            const userName = localStorage.getItem('user_name')
            setUser({
              id: userId,
              email: userEmail,
              name: userName || userEmail.split('@')[0],
            })
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error)
      } finally {
        setIsLoading(false)
      }
    }

    initAuth()
  }, [])

  // Login function
  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true)
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      console.log(response, "response")

      if (!response.ok) {
        const errorText = await response.text()
        return { success: false, error: errorText || 'Invalid credentials' }
      }
      console.log("response ok")

      const data = await response.json()
      
      // Store token and basic user info
      localStorage.setItem('auth_token', data.token)
      localStorage.setItem('user_id', data.user_id.toString())
      localStorage.setItem('user_email', email)
      
      // Fetch complete user profile from backend
      const fullUserProfile = await fetchUserProfile(data.user_id.toString(), data.token)
      
      if (fullUserProfile) {
        // Store complete user data
        localStorage.setItem('user_name', fullUserProfile.name)
        setUser(fullUserProfile)
      } else {
        // Fallback to basic user info if profile fetch fails
        const fallbackName = email.split('@')[0]
        localStorage.setItem('user_name', fallbackName)
        setUser({
          id: data.user_id.toString(),
          email: email,
          name: fallbackName,
        })
      }

      return { success: true }
    } catch (error) {
      console.error('Login error:', error)
      return { success: false, error: 'Network error. Please check if the backend is running.' }
    } finally {
      setIsLoading(false)
    }
  }

  // Signup function
  const signup = async (userData: SignupData): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true)
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: userData.name,
          email: userData.email,
          password: userData.password,
          gender: userData.gender,
          age: userData.age,
          city: userData.city,
        }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        return { success: false, error: errorText || 'Signup failed' }
      }

      const data = await response.json()
      
      // Store token and basic user info
      localStorage.setItem('auth_token', data.token)
      localStorage.setItem('user_id', data.user_id.toString())
      localStorage.setItem('user_email', userData.email)
      localStorage.setItem('user_name', userData.name)
      
      // Fetch complete user profile from backend
      const fullUserProfile = await fetchUserProfile(data.user_id.toString(), data.token)
      
      if (fullUserProfile) {
        setUser(fullUserProfile)
      } else {
        // Fallback to basic user info if profile fetch fails
        setUser({
          id: data.user_id.toString(),
          email: userData.email,
          name: userData.name,
        })
      }

      return { success: true }
    } catch (error) {
      console.error('Signup error:', error)
      return { success: false, error: 'Network error. Please check if the backend is running.' }
    } finally {
      setIsLoading(false)
    }
  }

  // Logout function
  const logout = () => {
    // Clear all localStorage items related to auth
    localStorage.removeItem('auth_token')
    localStorage.removeItem('user_id')
    localStorage.removeItem('user_email')
    localStorage.removeItem('user_name')
    
    // Clear user state
    setUser(null)
  }

  // Update user function
  const updateUser = (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData }
      setUser(updatedUser)
      
      // Update localStorage if needed
      if (userData.name) {
        localStorage.setItem('user_name', userData.name)
      }
      if (userData.email) {
        localStorage.setItem('user_email', userData.email)
      }
    }
  }

  // Refresh user data from backend
  const refreshUserData = async (): Promise<void> => {
    const token = localStorage.getItem('auth_token')
    const userId = localStorage.getItem('user_id')
    
    if (token && userId) {
      try {
        const fullUserProfile = await fetchUserProfile(userId, token)
        if (fullUserProfile) {
          setUser(fullUserProfile)
          localStorage.setItem('user_name', fullUserProfile.name)
        }
      } catch (error) {
        console.error('Error refreshing user data:', error)
      }
    }
  }

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated,
    login,
    logout,
    signup,
    updateUser,
    refreshUserData
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
