import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { getToken } from 'next-auth/jwt'

export async function GET(request: Request) {
  try {
    // Get session from auth()
    const session = await auth()
    
    // Get token from JWT
    const token = await getToken({

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      req: request as unknown as any,
      secret: process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET,
      secureCookie: process.env.NEXTAUTH_URL?.startsWith('https://') ?? true,
    })
    
    // Get cookies from request
    const cookies = request.headers.get('cookie')
    const allCookies = cookies?.split(';').map(c => c.trim()) || []
    const sessionCookie = allCookies.find(c => c.startsWith('next-auth.session-token='))
    const secureCookie = allCookies.find(c => c.startsWith('__Secure-next-auth.session-token='))
    
    return NextResponse.json({
      environment: {
        NODE_ENV: process.env.NODE_ENV,
        NEXTAUTH_URL: process.env.NEXTAUTH_URL,
        hasAuthSecret: !!process.env.AUTH_SECRET,
        hasNextAuthSecret: !!process.env.NEXTAUTH_SECRET,
        isHttps: process.env.NEXTAUTH_URL?.startsWith('https://'),
      },
      session: session ? {
        user: session.user,
        expires: session.expires,
      } : null,
      token: token ? {
        id: token.id,
        role: token.role,
        email: token.email,
      } : null,
      cookies: {
        allCookieNames: allCookies.map(c => c.split('=')[0]),
        hasCookie: !!sessionCookie,
        hasSecureCookie: !!secureCookie,
        rawCookie: sessionCookie ? '[PRESENT]' : '[MISSING]',
        rawSecureCookie: secureCookie ? '[PRESENT]' : '[MISSING]',
        totalCookies: allCookies.length,
      }
    }, { status: 200 })
  } catch (error) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    }, { status: 500 })
  }
}
