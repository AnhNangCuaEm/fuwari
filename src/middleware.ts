import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"
import createIntlMiddleware from 'next-intl/middleware';

// Create intl middleware
const intlMiddleware = createIntlMiddleware({
  locales: ['ja', 'en'],
  defaultLocale: 'ja',
  localePrefix: 'as-needed'
});

export const config = {
  matcher: [
    // Match all pathnames except for
    // - API routes
    // - Static files
    // - Image files
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\..*|3dmodels).*)',
  ]
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Handle internationalization first
  const response = intlMiddleware(request);
  
  // Get token with cookieName to ensure compatibility
  const token = await getToken({ 
    req: request, 
    secret: process.env.NEXTAUTH_SECRET,
    secureCookie: false, // Set to false for better compatibility, especially without HTTPS
  })
  
  // Helper function to check if path matches protected routes
  const isProtectedPath = (path: string, routes: string[]) => {
    return routes.some(route => {
      return path === route || 
             path.startsWith(`${route}/`) ||
             path === `/ja${route}` ||
             path.startsWith(`/ja${route}/`) ||
             path === `/en${route}` ||
             path.startsWith(`/en${route}/`);
    });
  };
  
  // Protect admin routes
  if (isProtectedPath(pathname, ['/admin'])) {
    if (!token) {
      const locale = pathname.startsWith('/en') ? 'en' : 'ja';
      return NextResponse.redirect(new URL(`/${locale === 'ja' ? '' : locale + '/'}auth/signin`, request.url))
    }
    if (token.role !== 'admin') {
      const locale = pathname.startsWith('/en') ? 'en' : 'ja';
      return NextResponse.redirect(new URL(`/${locale === 'ja' ? '' : locale + '/'}unauthorized`, request.url))
    }
  }
  
  // Protect mypage routes
  if (isProtectedPath(pathname, ['/mypage'])) {
    if (!token) {
      const locale = pathname.startsWith('/en') ? 'en' : 'ja';
      return NextResponse.redirect(new URL(`/${locale === 'ja' ? '' : locale + '/'}auth/signin`, request.url))
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
  
  return response;
}
