import { withAuth } from 'next-auth/middleware'

export default withAuth(
  function middleware(req) {
    // Additional middleware logic can go here
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Protect all routes except public ones
        const { pathname } = req.nextUrl
        
        // Public routes that don't require authentication
        const publicRoutes = ['/', '/login', '/unauthorized', '/api/auth']
        
        // Check if the current path is public
        const isPublicRoute = publicRoutes.some(route => 
          pathname === route || pathname.startsWith(route)
        )
        
        if (isPublicRoute) {
          return true
        }
        
        // For protected routes, require authentication
        return !!token
      },
    },
  }
)

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (NextAuth API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api/auth|_next/static|_next/image|favicon.ico).*)',
  ],
}