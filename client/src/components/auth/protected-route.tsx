'use client'

import { useAuth } from '@/contexts/auth-context'
import { useRouter } from 'next/navigation'
import { useEffect, type ReactNode } from 'react'

interface ProtectedRouteProps {
  children: ReactNode
  redirectTo?: string
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  redirectTo = '/login' 
}) => {
  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push(redirectTo)
    }
  }, [isAuthenticated, isLoading, router, redirectTo])

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-white">Loading...</span>
        </div>
      </div>
    )
  }

  // If not authenticated, don't render children (will redirect)
  if (!isAuthenticated) {
    return null
  }

  return <>{children}</>
}

// HOC version for wrapping page components
export const withAuth = <P extends object>(
  Component: React.ComponentType<P>,
  redirectTo?: string
) => {
  const AuthenticatedComponent: React.FC<P> = (props) => (
    <ProtectedRoute redirectTo={redirectTo}>
      <Component {...props} />
    </ProtectedRoute>
  )

  AuthenticatedComponent.displayName = `withAuth(${Component.displayName || Component.name})`
  
  return AuthenticatedComponent
}
