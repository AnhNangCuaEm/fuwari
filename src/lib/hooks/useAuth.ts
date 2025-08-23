'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { User } from '@/types/user'

// Hook for fetching current user information
export function useCurrentUser() {
  const { data: session, status } = useSession()
  
  const user = session?.user ? {
    id: session.user.id,
    name: session.user.name || '',
    email: session.user.email || '',
    role: session.user.role as 'user' | 'admin',
    provider: 'credentials' as const,
    image: session.user.image || undefined,
    createdAt: '',
    updatedAt: ''
  } : null

  return {
    user,
    isLoading: status === 'loading',
    isAuthenticated: status === 'authenticated',
    isUnauthenticated: status === 'unauthenticated'
  }
}

// Hook for checking admin privileges
export function useIsAdmin() {
  const { user, isLoading } = useCurrentUser()
  
  return {
    isAdmin: user?.role === 'admin',
    isLoading,
    user
  }
}

// Hook for checking access permissions
export function usePermissions() {
  const { user, isLoading, isAuthenticated } = useCurrentUser()
  
  const isAdmin = user?.role === 'admin'
  
  const canAccessAdminPanel = isAdmin
  const canManageUsers = isAdmin
  const canAccessUserProfile = (profileUserId: string) => {
    return user?.id === profileUserId || isAdmin
  }
  const hasRole = (role: 'user' | 'admin') => user?.role === role

  return {
    user,
    isLoading,
    isAuthenticated,
    isAdmin,
    canAccessAdminPanel,
    canManageUsers,
    canAccessUserProfile,
    hasRole
  }
}

// Hook for fetching auth status from API (alternative approach)
export function useAuthStatus() {
  const [authStatus, setAuthStatus] = useState<{
    isAuthenticated: boolean
    user: User | null
    message: string
    isLoading: boolean
  }>({
    isAuthenticated: false,
    user: null,
    message: '',
    isLoading: true
  })

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const response = await fetch('/api/auth/status')
        const data = await response.json()
        
        setAuthStatus({
          isAuthenticated: data.isAuthenticated,
          user: data.user,
          message: data.message,
          isLoading: false
        })
      } catch (error) {
        console.error('Error fetching auth status:', error)
        setAuthStatus({
          isAuthenticated: false,
          user: null,
          message: 'Error fetching auth status',
          isLoading: false
        })
      }
    }

    fetchStatus()
  }, [])

  return authStatus
}

// Hook for checking admin status from API
export function useAdminStatus() {
  const [adminStatus, setAdminStatus] = useState<{
    isAdmin: boolean
    user: User | null
    message: string
    isLoading: boolean
  }>({
    isAdmin: false,
    user: null,
    message: '',
    isLoading: true
  })

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const response = await fetch('/api/auth/admin')
        const data = await response.json()
        
        setAdminStatus({
          isAdmin: data.isAdmin,
          user: data.user,
          message: data.message,
          isLoading: false
        })
      } catch (error) {
        console.error('Error fetching admin status:', error)
        setAdminStatus({
          isAdmin: false,
          user: null,
          message: 'Error fetching admin status',
          isLoading: false
        })
      }
    }

    fetchStatus()
  }, [])

  return adminStatus
}
