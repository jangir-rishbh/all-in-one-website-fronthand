import { NextResponse, type NextRequest } from 'next/server'
import { verifySession } from '@/lib/session'

/** Same-origin proxy (`app/api/auth/me/route.ts`) — Edge fetch to localhost:backend often fails in dev. */
function authMeUrl(request: NextRequest): string {
  return new URL('/api/auth/me', request.nextUrl.origin).toString()
}

// Define public routes that don't require authentication
const publicRoutes = [
  '/',
  '/home',
  '/about',
  '/contact',
  '/login',
  '/login-password',
  '/login-otp',
  '/signup',
  '/verify-otp',
  '/forgot-password',
  '/phone-verification',
  '/_next',
  '/favicon.ico',
  '/api/auth'
]

/** Match first proxy branch: do not use pathname.startsWith('/') — that marks every path public. */
function isPublicPath(pathname: string): boolean {
  return (
    publicRoutes.some(
      (route) =>
        pathname === route ||
        pathname.startsWith(`${route}/`) ||
        pathname.startsWith('/_next/') ||
        pathname.startsWith('/favicon.ico')
    )
  )
}

export async function proxy(request: NextRequest) {
  // Create a response object
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const { pathname } = request.nextUrl
  
  // Skip middleware for public routes and static files
  if (isPublicPath(pathname)) {
    // If user is logged in and tries to access login/signup, redirect to home
    if ((pathname === '/login' || pathname === '/signup') && request.cookies.has('sb-access-token')) {
      const url = request.nextUrl.clone()
      url.pathname = '/home'
      return NextResponse.redirect(url)
    }
    return response
  }

  // Legacy HMAC `session` cookie (Next) or FastAPI JWT `session_token`
  const sessionToken = request.cookies.get('session')?.value || ''
  const jwtCookie = request.cookies.get('session_token')?.value || ''
  const customToken = request.cookies.get('custom_token')?.value || ''
  let sessionPayload: any = null

  if (sessionToken) {
    try {
      sessionPayload = await verifySession(sessionToken)
    } catch {
      // Invalid session token
    }
  }

  const hasAuth = Boolean(sessionPayload || jwtCookie || customToken)

  // Admin / banned checks use FastAPI /api/auth/me (same cookies as browser)

  if (hasAuth && !pathname.startsWith('/login') && !pathname.startsWith('/signup')) {
    try {
      const cookieHeader = request.headers.get('cookie') || ''
      const rawToken = request.cookies.get('custom_token')?.value
      let bearerToken: string | undefined
      if (rawToken) {
        try {
          bearerToken = decodeURIComponent(rawToken)
        } catch {
          bearerToken = rawToken
        }
      }
      const checkResponse = await fetch(authMeUrl(request), {
        cache: 'no-store',
        headers: {
          Cookie: cookieHeader,
          ...(bearerToken ? { Authorization: `Bearer ${bearerToken}` } : {}),
        },
      })
      
      const checkData = (await checkResponse.json().catch(() => ({}))) as {
        user?: { role?: string } | null
        banned?: boolean
      }

      if (checkData.banned) {
        const url = request.nextUrl.clone()
        url.pathname = '/login'
        url.searchParams.set('banned', 'true')
        return NextResponse.redirect(url)
      }

      // Enforce admin access using live role from /api/auth/me (requires valid cookie/token)
      if (pathname.startsWith('/admin')) {
        if (
          !checkResponse.ok ||
          !checkData.user ||
          checkData.user.role !== 'admin'
        ) {
          const url = request.nextUrl.clone()
          url.pathname = '/login'
          url.searchParams.set('redirectedFrom', pathname)
          return NextResponse.redirect(url)
        }
      }
    } catch {
      // Edge → localhost backend often fails; let page load — client AdminGate + /api/auth/me still enforce
      if (pathname.startsWith('/admin')) {
        return response
      }
    }
  }

  // If no session and trying to access protected route, redirect to login
  if (!hasAuth && !isPublicPath(pathname)) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('redirectedFrom', pathname)
    return NextResponse.redirect(url)
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - api (API routes)
     * - public (public files)
     */
    '/((?!_next/static|_next/image|favicon.ico|api|public).*)',
  ],
}
