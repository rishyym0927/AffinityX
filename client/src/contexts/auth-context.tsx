'use client'

import React, { createContext, useContext, useEffect, useState, type ReactNode } from 'react'

// Types
export interface User {
  id: string
  email: string
  name: string
  avatar?: string
  preferences?: {
    ageRange: [number, number]
    interests: string[]
    location: string
  }
}

export interface AuthState {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
}

export interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  logout: () => void
  signup: (email: string, password: string, name: string) => Promise<{ success: boolean; error?: string }>
  updateUser: (userData: Partial<User>) => void
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

  const isAuthenticated = !!user

  // Initialize auth state from localStorage
  useEffect(() => {
    const initializeAuth = () => {
      try {
        const storedUser = localStorage.getItem('affinity_user')
        const token = localStorage.getItem('affinity_token')
        
        if (storedUser && token) {
          setUser(JSON.parse(storedUser))
        }
      } catch (error) {
        console.error('Error initializing auth:', error)
        localStorage.removeItem('affinity_user')
        localStorage.removeItem('affinity_token')
      } finally {
        setIsLoading(false)
      }
    }

    initializeAuth()
  }, [])

  // Mock login function - replace with actual API call
  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true)
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Mock validation - replace with actual API call
      if (email && password.length >= 6) {
        const mockUser: User = {
          id: Date.now().toString(),
          email,
          name: email.split('@')[0],
          avatar: '/default.jpg',
          preferences: {
            ageRange: [22, 35],
            interests: ['Technology', 'AI', 'Web Development'],
            location: 'Remote'
          }
        }
        
        const mockToken = 'mock_jwt_token_' + Date.now()
        
        // Store in localStorage
        localStorage.setItem('affinity_user', JSON.stringify(mockUser))
        localStorage.setItem('affinity_token', mockToken)
        
        setUser(mockUser)
        return { success: true }
      } else {
        return { success: false, error: 'Invalid email or password' }
      }
    } catch (error) {
      return { success: false, error: 'Login failed. Please try again.' }
    } finally {
      setIsLoading(false)
    }
  }

  // Mock signup function - replace with actual API call
  const signup = async (email: string, password: string, name: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true)
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Mock validation - replace with actual API call
      if (email && password.length >= 6 && name.trim()) {
        const mockUser: User = {
          id: Date.now().toString(),
          email,
          name: name.trim(),
          avatar: '/default.jpg',
          preferences: {
            ageRange: [22, 35],
            interests: [],
            location: ''
          }
        }
        
        const mockToken = 'mock_jwt_token_' + Date.now()
        
        // Store in localStorage
        localStorage.setItem('affinity_user', JSON.stringify(mockUser))
        localStorage.setItem('affinity_token', mockToken)
        
        setUser(mockUser)
        return { success: true }
      } else {
        return { success: false, error: 'Please fill in all required fields' }
      }
    } catch (error) {
      return { success: false, error: 'Signup failed. Please try again.' }
    } finally {
      setIsLoading(false)
    }
  }

  // Logout function
  const logout = () => {
    setUser(null)
    localStorage.removeItem('affinity_user')
    localStorage.removeItem('affinity_token')
    // Force reload to clear all state and redirect to home
    window.location.reload()
  }

  // Update user function
  const updateUser = (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData }
      setUser(updatedUser)
      localStorage.setItem('affinity_user', JSON.stringify(updatedUser))
    }
  }

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated,
    login,
    logout,
    signup,
    updateUser
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
