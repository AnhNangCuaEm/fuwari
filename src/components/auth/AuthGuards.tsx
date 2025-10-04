'use client'

import { ReactNode } from 'react'
import { useCurrentUser, useIsAdmin } from '@/lib/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

interface AuthGuardProps {
    children: ReactNode
    fallback?: ReactNode
    redirectTo?: string
}

interface AdminGuardProps {
    children: ReactNode
    fallback?: ReactNode
    redirectTo?: string
}

interface RoleGuardProps {
    children: ReactNode
    allowedRoles: ('user' | 'admin')[]
    fallback?: ReactNode
    redirectTo?: string
}

// Component to protect routes that require authentication
export function AuthGuard({
    children,
    fallback,
    redirectTo = '/auth/signin'
}: AuthGuardProps) {
    const { isAuthenticated, isLoading } = useCurrentUser()
    const router = useRouter()

    useEffect(() => {
        if (!isLoading && !isAuthenticated && redirectTo) {
            router.push(redirectTo)
        }
    }, [isAuthenticated, isLoading, redirectTo, router])

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[200px]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        )
    }

    if (!isAuthenticated) {
        return fallback ? <>{fallback}</> : null
    }

    return <>{children}</>
}

export function AdminGuard({
    children,
    fallback,
    redirectTo = '/unauthorized'
}: AdminGuardProps) {
    const { isAdmin, isLoading } = useIsAdmin()
    const router = useRouter()

    useEffect(() => {
        if (!isLoading && !isAdmin && redirectTo) {
            router.push(redirectTo)
        }
    }, [isAdmin, isLoading, redirectTo, router])

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[200px]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        )
    }

    if (!isAdmin) {
        return fallback ? <>{fallback}</> : null
    }

    return <>{children}</>
}

export function RoleGuard({
    children,
    allowedRoles,
    fallback,
    redirectTo = '/unauthorized'
}: RoleGuardProps) {
    const { user, isLoading } = useCurrentUser()
    const router = useRouter()

    const hasAllowedRole = user && allowedRoles.includes(user.role)

    useEffect(() => {
        if (!isLoading && !hasAllowedRole && redirectTo) {
            router.push(redirectTo)
        }
    }, [hasAllowedRole, isLoading, redirectTo, router])

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[200px]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        )
    }

    if (!hasAllowedRole) {
        return fallback ? <>{fallback}</> : null
    }

    return <>{children}</>
}

// Component to show different content based on auth status
interface ConditionalAuthContentProps {
    children: ReactNode
    fallback?: ReactNode
    adminOnly?: boolean
    requireAuth?: boolean
}

export function ConditionalAuthContent({
    children,
    fallback,
    adminOnly = false,
    requireAuth = true
}: ConditionalAuthContentProps) {
    const { user, isLoading, isAuthenticated } = useCurrentUser()

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[50px]">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-almond-5"></div>
            </div>
        )
    }

    // If requireAuth is true but user is not authenticated
    if (requireAuth && !isAuthenticated) {
        return fallback ? <>{fallback}</> : null
    }

    // If adminOnly is true but user is not admin
    if (adminOnly && user?.role !== 'admin') {
        return fallback ? <>{fallback}</> : null
    }

    return <>{children}</>
}

// Higher-order component cho auth protection
export function withAuth<P extends object>(
    Component: React.ComponentType<P>,
    options?: {
        requireAuth?: boolean
        requireAdmin?: boolean
        redirectTo?: string
    }
) {
    const WrappedComponent = (props: P) => {
        const { requireAuth = true, requireAdmin = false, redirectTo } = options || {}

        if (requireAdmin) {
            return (
                <AdminGuard redirectTo={redirectTo}>
                    <Component {...props} />
                </AdminGuard>
            )
        }

        if (requireAuth) {
            return (
                <AuthGuard redirectTo={redirectTo}>
                    <Component {...props} />
                </AuthGuard>
            )
        }

        return <Component {...props} />
    }

    WrappedComponent.displayName = `withAuth(${Component.displayName || Component.name})`

    return WrappedComponent
}
