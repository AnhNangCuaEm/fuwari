import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"

export const config = {
  matcher: [
    '/admin/:path*',
    '/mypage/:path*',
    '/api/admin/:path*',
    '/api/user/:path*'
  ]
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Get token
  const token = await getToken({ 
    req: request, 
    secret: process.env.NEXTAUTH_SECRET 
  })
  
  // Protect admin routes
  if (pathname.startsWith('/admin')) {
    if (!token) {
      return NextResponse.redirect(new URL('/auth/signin', request.url))
    }
    if (token.role !== 'admin') {
      return NextResponse.redirect(new URL('/unauthorized', request.url))
    }
  }
  
  // Protect mypage routes
  if (pathname.startsWith('/mypage')) {
    if (!token) {
      return NextResponse.redirect(new URL('/auth/signin', request.url))
    }
  }
  
  // Protect admin API routes
  if (pathname.startsWith('/api/admin')) {
    if (!token || token.role !== 'admin') {
      return NextResponse.json(
        { message: 'Admin access required' },
        { status: 403 }
      )
    }
  }
  
  // Protect user API routes
  if (pathname.startsWith('/api/user')) {
    if (!token) {
      return NextResponse.json(
        { message: 'Authentication required' },
        { status: 401 }
      )
    }
  }
  
  return NextResponse.next()
}
