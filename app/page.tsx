'use client'

import { useSession } from 'next-auth/react'
import Link from 'next/link'

export default function Home() {
  const { data: session, status } = useSession()

  if (status === 'loading') {
    return (
      <main className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="animate-pulse">Loading...</div>
        </div>
      </main>
    )
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-800 mb-6">
          Welcome to Alumni Network
        </h1>
        
        {session ? (
          <>
            <p className="text-lg text-gray-600 mb-4">
              Hello, {session.user?.name || session.user?.email}!
            </p>
            {session.user?.alumni && (
              <p className="text-md text-gray-500 mb-8">
                Class of {session.user.alumni.graduationYear} • {session.user.alumni.department}
              </p>
            )}
            <p className="text-lg text-gray-600 mb-8">
              Connect with our vibrant community of graduates and build lasting professional relationships.
            </p>
            <div className="space-x-4">
              <Link
                href="/alumni"
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition duration-200"
              >
                Browse Alumni
              </Link>
              <Link
                href="/admin"
                className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition duration-200"
              >
                Admin Dashboard
              </Link>
            </div>
          </>
        ) : (
          <>
            <p className="text-lg text-gray-600 mb-8">
              Connect with our vibrant community of graduates and build lasting professional relationships.
            </p>
            <Link
              href="/login"
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition duration-200"
            >
              Sign In to Continue
            </Link>
          </>
        )}
      </div>
    </main>
  )
}
