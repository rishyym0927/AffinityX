'use client'

import { type ReactNode } from 'react'

interface ProtectedRouteProps {
  children: ReactNode
  redirectTo?: string
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  redirectTo = '/login' 
}) => {
  // Protected routes disabled - always render children
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
