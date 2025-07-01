'use client'

import { type ReactNode } from 'react'

interface PublicRouteProps {
  children: ReactNode
  redirectTo?: string
}

export const PublicRoute: React.FC<PublicRouteProps> = ({ 
  children, 
  redirectTo = '/dashboard' 
}) => {
  // Public routes disabled - always render children
  return <>{children}</>
}
