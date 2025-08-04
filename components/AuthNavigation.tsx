'use client'

import { useSession, signOut } from 'next-auth/react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function AuthNavigation() {
  const { data: session, status } = useSession()
  const pathname = usePathname()

  // Don't show navigation on auth pages
  if (pathname === '/login' || pathname === '/unauthorized') {
    return null
  }

  return (
    <nav className="bg-blue-600 text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <h1 className="text-xl font-bold">Alumni Network</h1>
        
        <div className="flex items-center space-x-4">
          {status === 'loading' ? (
            <div className="animate-pulse">Loading...</div>
          ) : status === 'authenticated' ? (
            <>
              <Link href="/" className="hover:text-blue-200">Home</Link>
              <Link href="/alumni" className="hover:text-blue-200">Alumni</Link>
              <Link href="/admin" className="hover:text-blue-200">Admin</Link>
              
              <div className="flex items-center space-x-3 ml-10">
                {session.user?.image && (
                  <img 
                    src={session.user.image} 
                    alt="Profile" 
                    className="w-8 h-8 rounded-full"
                  />
                )}
                <span className="text-sm">
                  Welcome, {session.user?.name || session.user?.email}
                </span>
                <button
                  onClick={() => signOut({ callbackUrl: '/login' })}
                  className="bg-blue-700 hover:bg-blue-800 px-3 py-1 rounded text-sm transition duration-200"
                >
                  Sign Out
                </button>
              </div>
            </>
          ) : (
            <Link 
              href="/login"
              className="bg-blue-700 hover:bg-blue-800 px-4 py-2 rounded transition duration-200"
            >
              Sign In
            </Link>
          )}
        </div>
      </div>
    </nav>
  )
}
