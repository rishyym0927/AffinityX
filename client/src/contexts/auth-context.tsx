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
  const [isLoading, setIsLoading] = useState(false) // Disabled auth loading

  // Disabled authentication - always false
  const isAuthenticated = false

  // Disabled auth initialization
  useEffect(() => {
    // Authentication disabled - no initialization needed
    setIsLoading(false)
  }, [])

  // Disabled login function
  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    // Authentication disabled
    return { success: false, error: 'Authentication is currently disabled' }
  }

  // Disabled signup function
  const signup = async (email: string, password: string, name: string): Promise<{ success: boolean; error?: string }> => {
    // Signup disabled - you can implement your own authentication
    return { success: false, error: 'Signup is currently disabled' }
  }

  // Disabled logout function
  const logout = () => {
    // Authentication disabled - no logout needed
    console.log('Logout disabled')
  }

  // Disabled update user function
  const updateUser = (userData: Partial<User>) => {
    // Authentication disabled - no user updates
    console.log('User update disabled', userData)
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
