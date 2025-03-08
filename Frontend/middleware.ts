import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Define protected and public routes
const protectedRoutes = ['/dashboard', '/account']
const authRoutes = ['/login', '/register', '/forgot-password']

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  
  // Skip favicon, API routes, and routes with query parameters (important!)
  if (pathname.includes('favicon') || pathname.startsWith('/api/') || req.nextUrl.search) {
    return NextResponse.next()
  }
  
  // Check if the current route is protected
  const isProtectedRoute = protectedRoutes.some(route => 
    pathname === route || pathname.startsWith(`${route}/`)
  )
  
  // Check if the current route is an auth page
  const isAuthRoute = authRoutes.some(route => 
    pathname === route || pathname.startsWith(`${route}/`)
  )
  
  // Check for any Supabase auth cookie
  const cookieString = req.headers.get('cookie') || ''
  const hasAuthCookie = cookieString.includes('supabase-auth-token') || 
                        cookieString.includes('sb-')
  
  // If accessing a protected route without auth cookies
  if (isProtectedRoute && !hasAuthCookie) {
    const redirectUrl = new URL('/login', req.url)
    return NextResponse.redirect(redirectUrl)
  }
  
  // If accessing an auth route with auth cookies
  if (isAuthRoute && hasAuthCookie) {
    const redirectUrl = new URL('/', req.url)
    return NextResponse.redirect(redirectUrl)
  }
  
  return NextResponse.next()
}

// Only run middleware on specific paths
export const config = {
  matcher: [
    '/',
    '/dashboard/:path*',
    '/account/:path*',
    '/login',
    '/register',
    '/forgot-password'
  ],
}
