import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // Simple middleware for any global logic
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};

/*
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/request'
import { getToken } from 'next-auth/jwt'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Admin routes - no changes needed
  if (pathname.startsWith('/admin')) {
    return NextResponse.next()
  }

  // Public routes
  if (
    pathname === '/' ||
    pathname === '/login' ||
    pathname === '/unauthorized' ||
    pathname.startsWith('/api/auth') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/public')
  ) {
    return NextResponse.next()
  }

  // Protected user routes
  const token = await getToken({ req: request })
  
  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Check profile status for user routes
  if (pathname.startsWith('/dashboard') || pathname.startsWith('/alumni')) {
    const profileStatus = token.profileStatus

    // Redirect to profile page if no profile exists, pending, or rejected
    if (profileStatus === 'no_profile' || profileStatus === 'pending' || profileStatus === 'rejected') {
      return NextResponse.redirect(new URL('/profile', request.url))
    }

    // Only approved users can access dashboard and alumni pages
    if (profileStatus !== 'approved') {
      return NextResponse.redirect(new URL('/profile', request.url))
    }
  }

  // Handle login redirect for authenticated users
  if (pathname === '/login' && token) {
    return NextResponse.redirect(new URL('/profile', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}

*/
