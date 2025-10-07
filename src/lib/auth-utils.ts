import { auth } from "@/lib/auth"
import { User } from "@/types/user"

// Server-side auth utilities
export async function getCurrentUser(): Promise<User | null> {
  try {
    const session = await auth()
    
    if (!session?.user) {
      return null
    }

    return {
      id: session.user.id,
      name: session.user.name || '',
      email: session.user.email || '',
      role: session.user.role as 'user' | 'admin',
      provider: 'credentials', // This could be enhanced to track actual provider
      image: session.user.image || undefined,
      status: 'active',
      createdAt: '', // These would need to be fetched from user store if needed
      updatedAt: ''
    }
  } catch (error) {
    console.error('Error getting current user:', error)
    return null
  }
}

export async function requireAuth(): Promise<User> {
  const user = await getCurrentUser()
  
  if (!user) {
    throw new Error('Authentication required')
  }
  
  return user
}

export async function requireAdmin(): Promise<User> {
  const user = await requireAuth()
  
  if (user.role !== 'admin') {
    throw new Error('Admin access required')
  }
  
  return user
}

export async function isAuthenticated(): Promise<boolean> {
  const user = await getCurrentUser()
  return user !== null
}

export async function isAdmin(userId?: string): Promise<boolean> {
  const user = await getCurrentUser()
  
  if (!user) {
    return false
  }
  
  // If userId is provided, check if current user is admin and matches the userId
  if (userId && user.id !== userId) {
    return false
  }
  
  return user.role === 'admin'
}

export async function hasRole(role: 'user' | 'admin'): Promise<boolean> {
  const user = await getCurrentUser()
  return user?.role === role || false
}

// Permission checking utilities
export async function canAccessAdminPanel(): Promise<boolean> {
  return await isAdmin()
}

export async function canManageUsers(): Promise<boolean> {
  return await isAdmin()
}

export async function canAccessUserProfile(profileUserId: string): Promise<boolean> {
  const currentUser = await getCurrentUser()
  
  if (!currentUser) {
    return false
  }
  
  // Users can access their own profile, admins can access any profile
  return currentUser.id === profileUserId || currentUser.role === 'admin'
}

// Client-side auth status fetcher (for use in components)
export async function fetchAuthStatus(): Promise<{
  isAuthenticated: boolean
  user: User | null
  message: string
}> {
  try {
    const response = await fetch('/api/auth/status')
    const data = await response.json()
    return data
  } catch (error) {
    console.error('Error fetching auth status:', error)
    return {
      isAuthenticated: false,
      user: null,
      message: 'Error fetching auth status'
    }
  }
}

export async function fetchAdminStatus(): Promise<{
  isAdmin: boolean
  user: User | null
  message: string
}> {
  try {
    const response = await fetch('/api/auth/admin')
    const data = await response.json()
    return data
  } catch (error) {
    console.error('Error fetching admin status:', error)
    return {
      isAdmin: false,
      user: null,
      message: 'Error fetching admin status'
    }
  }
}
