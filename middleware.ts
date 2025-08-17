import { NextRequest, NextResponse } from "next/server"

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Public routes that don't require authentication
  const publicRoutes = [
    '/',
    '/auth/signin',
    '/auth/signup',
    '/api/auth',
    '/api/health',
    '/privacy',
    '/terms',
    '/how-it-works',
    '/creators',
    '/print-shops',
    '/browse',
    '/help',
    '/contact',
    '/demo',
    '/accessibility',
    '/security',
    '/sitemap'
  ]

  // Static and public file routes
  const staticRoutes = [
    '/_next',
    '/favicon.ico',
    '/api/auth', // NextAuth handles its own auth
  ]

  // Check if the current path is public or static
  const isPublicRoute = publicRoutes.some(route => 
    pathname === route || pathname.startsWith(route + '/')
  )
  
  const isStaticRoute = staticRoutes.some(route => 
    pathname.startsWith(route)
  )

  // Allow public and static routes
  if (isPublicRoute || isStaticRoute) {
    return NextResponse.next()
  }

  // For protected routes, we'll handle authorization in the individual pages/API routes
  // using server-side auth checks rather than middleware auth checks
  // This avoids the Edge Runtime limitations with MongoDB

  // Only block routes that we know require authentication
  const protectedRoutes = ['/admin', '/shop-dashboard', '/creator-dashboard', '/profile', '/settings']
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route))

  if (isProtectedRoute) {
    // Check for session cookie existence (basic check without JWT verification)
    const sessionCookie = request.cookies.get('next-auth.session-token') || 
                         request.cookies.get('__Secure-next-auth.session-token')

    if (!sessionCookie) {
      return NextResponse.redirect(new URL('/auth/signin', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, etc.)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'
  ]
}