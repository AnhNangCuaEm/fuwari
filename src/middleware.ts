import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"
import createIntlMiddleware from 'next-intl/middleware';

// Create intl middleware
const intlMiddleware = createIntlMiddleware({
  locales: ['ja', 'en'],
  defaultLocale: 'ja',
  localePrefix: 'as-needed',
  localeDetection: false
});

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\..*|3dmodels).*)',
  ]
}

/**
 * Check maintenance mode.
 * 1. First reads the cookie (fast, no DB hit).
 * 2. If cookie is absent, falls back to the internal API (queries DB once,
 *    then the response sets the cookie for all future requests).
 */
async function checkMaintenance(request: NextRequest): Promise<{ active: boolean; cookieValue: string | null }> {
  const cookie = request.cookies.get('fuwari-maintenance')

  // Cookie already set — trust it directly (no DB round-trip)
  if (cookie !== undefined) {
    return { active: cookie.value === 'true', cookieValue: cookie.value }
  }

  // Cookie missing — query the DB via internal API and get the authoritative value
  try {
    const url = new URL('/api/internal/maintenance', request.url)
    const res = await fetch(url.toString(), { next: { revalidate: 0 } })
    if (res.ok) {
      const data = await res.json()
      return { active: !!data.active, cookieValue: null } // null = need to set cookie
    }
  } catch {
    // DB unreachable → fail open (don't block users)
  }

  return { active: false, cookieValue: null }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  const response = intlMiddleware(request);

  const isProduction = process.env.NODE_ENV === "production";
  const cookieName = isProduction
    ? '__Secure-next-auth.session-token'
    : 'next-auth.session-token';

  const token = await getToken({
    req: request,
    secret: process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET,
    secureCookie: isProduction,
    cookieName: cookieName,
  })

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

  // ── Maintenance Mode ────────────────────────────────────────────────────────
  const isMaintenancePage = isProtectedPath(pathname, ['/maintenance'])
  const isAdmin = token?.role === 'admin'

  // Admins and the maintenance page itself always bypass
  if (!isAdmin && !isMaintenancePage) {
    const { active, cookieValue } = await checkMaintenance(request)

    if (active) {
      const locale = pathname.startsWith('/en') ? 'en' : 'ja';
      const redirectRes = NextResponse.redirect(
        new URL(`/${locale === 'ja' ? '' : locale + '/'}maintenance`, request.url)
      )
      // Short TTL — re-check DB every 60s so toggling OFF takes effect quickly
      if (cookieValue === null) {
        redirectRes.cookies.set('fuwari-maintenance', 'true', {
          path: '/',
          httpOnly: true,
          sameSite: 'lax',
          maxAge: 60,
          secure: isProduction,
        })
      }
      return redirectRes
    }

    // If cookie was missing but DB says false, set a short-lived cookie
    // so we skip the DB fetch on subsequent requests within the TTL window.
    if (cookieValue === null) {
      response.cookies.set('fuwari-maintenance', 'false', {
        path: '/',
        httpOnly: true,
        sameSite: 'lax',
        maxAge: 60,
        secure: isProduction,
      })
    }
  }
  // ───────────────────────────────────────────────────────────────────────────

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
