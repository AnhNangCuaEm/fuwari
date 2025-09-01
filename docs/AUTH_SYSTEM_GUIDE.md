# Enhanced Auth System - Fuwari

## Overview

The auth system has been improved with features:

- ✅ API endpoints to check auth status
- ✅ Utility functions for server-side
- ✅ React hooks for client-side
- ✅ Auth guards components
- ✅ Middleware to protect routes
- ✅ Clear admin/user permissions

## Usage

### 1. Server-side Auth Utils

```typescript
import { 
  getCurrentUser, 
  requireAuth, 
  requireAdmin, 
  isAuthenticated, 
  isAdmin 
} from "@/lib/auth-utils"

// In server component or API route
const user = await getCurrentUser() // Returns User | null
const authUser = await requireAuth() // Throw error if not logged in
const adminUser = await requireAdmin() // Throw error if not admin

// Check status
const loggedIn = await isAuthenticated() // boolean
const userIsAdmin = await isAdmin() // boolean
```

### 2. Client-side Hooks

```typescript
import { 
  useCurrentUser, 
  useIsAdmin, 
  usePermissions 
} from "@/lib/hooks/useAuth"

function MyComponent() {
  const { user, isLoading, isAuthenticated } = useCurrentUser()
  const { isAdmin } = useIsAdmin()
  const { canAccessAdminPanel } = usePermissions()
  
  if (isLoading) return <div>Loading...</div>
  
  return (
    <div>
      {isAuthenticated ? (
        <p>Hello {user.name}!</p>
      ) : (
        <p>Please log in</p>
      )}
    </div>
  )
}
```

### 3. Auth Guards

```typescript
import { 
  AuthGuard, 
  AdminGuard, 
  ConditionalAuthContent 
} from "@/components/auth/AuthGuards"

function ProtectedPage() {
  return (
    <AuthGuard fallback={<div>Login required</div>}>
      <div>Content for logged in users</div>
    </AuthGuard>
  )
}

function AdminPage() {
  return (
    <AdminGuard>
      <div>Only admin can see this</div>
    </AdminGuard>
  )
}

// Display conditional content
function FlexibleContent() {
  return (
    <div>
      <ConditionalAuthContent 
        requireAuth={true}
        fallback={<div>Login to view</div>}
      >
        <div>Content for logged in users</div>
      </ConditionalAuthContent>
      
      <ConditionalAuthContent 
        adminOnly={true}
        fallback={null}
      >
        <div>Only admin can see this</div>
      </ConditionalAuthContent>
    </div>
  )
}
```

### 4. API Endpoints

#### Check login status
```
GET /api/auth/status
```
Response:
```json
{
  "isAuthenticated": true,
  "user": {
    "id": "...",
    "name": "...",
    "email": "...",
    "role": "user|admin"
  },
  "message": "Authenticated"
}
```

#### Check admin permission
```
GET /api/auth/admin
```

#### Get user profile information (login required)
```
GET /api/user/profile
PUT /api/user/profile
```

#### Manage users (admin only)
```
GET /api/admin/users
```

### 5. Middleware Protection

Middleware automatically protects routes:
- `/admin/*` - Requires admin permission
- `/mypage/*` - Requires login
- `/api/admin/*` - Admin-only API
- `/api/user/*` - Login-required API

### 6. Usage examples in pages

#### Page with different content based on auth status
```typescript
// pages/contact/page.tsx
import { getCurrentUser } from "@/lib/auth-utils"
import { ConditionalAuthContent } from "@/components/auth/AuthGuards"

export default async function ContactPage() {
  const user = await getCurrentUser()
  
  return (
    <div>
      {user ? (
        <p>Hello {user.name}! You have {user.role} permission</p>
      ) : (
        <p>Please log in</p>
      )}
      
      <ConditionalAuthContent adminOnly={true}>
        <div>Special content for admin</div>
      </ConditionalAuthContent>
    </div>
  )
}
```

#### Component with auth logic
```typescript
'use client'
import { usePermissions } from "@/lib/hooks/useAuth"

function CartButton() {
  const { isAuthenticated, user } = usePermissions()
  
  if (!isAuthenticated) {
    return (
      <button onClick={() => window.location.href = '/auth/signin'}>
        Login to purchase
      </button>
    )
  }
  
  return <button>Add to cart</button>
}
```

### 7. HOC (Higher-Order Component)

```typescript
import { withAuth } from "@/components/auth/AuthGuards"

const ProtectedComponent = withAuth(MyComponent, {
  requireAuth: true,
  requireAdmin: false,
  redirectTo: '/auth/signin'
})
```

## File Structure

```
src/
├── lib/
│   ├── auth.ts              # NextAuth config
│   ├── auth-utils.ts        # Server-side utilities
│   └── hooks/
│       └── useAuth.ts       # Client-side hooks
├── components/
│   └── auth/
│       └── AuthGuards.tsx   # Auth guard components
├── app/
│   ├── api/
│   │   ├── auth/
│   │   │   ├── status/route.ts    # Auth status API
│   │   │   └── admin/route.ts     # Admin check API
│   │   ├── user/
│   │   │   └── profile/route.ts   # User profile API
│   │   └── admin/
│   │       └── users/route.ts     # Admin users API
│   └── admin/
│       ├── layout.tsx       # Protected admin layout
│       ├── dashboard/page.tsx
│       └── users/page.tsx   # Users management
└── middleware.ts            # Route protection
```

## Best Practices

1. **Server-side**: Use `auth-utils.ts` functions
2. **Client-side**: Use hooks from `useAuth.ts`
3. **Conditional UI**: Use `ConditionalAuthContent`
4. **Page Protection**: Use `AuthGuard` or `AdminGuard`
5. **API Protection**: Middleware will automatically protect

## Migration from old system

1. Replace `useSession()` with `useCurrentUser()`
2. Replace manual session checks with auth guards
3. Use auth utils instead of calling auth() directly
4. API routes are automatically protected via middleware
