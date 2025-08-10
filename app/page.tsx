// app/page.tsx
import Link from "next/link";
import { Users, GraduationCap } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-100">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            RCEW Alumni Portal
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Connect with fellow alumni, and manage your profile.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Alumni Login */}
          <div className="bg-white rounded-lg shadow-xl p-8 text-center">
            <div className="mx-auto w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mb-6">
              <GraduationCap className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Alumni Access
            </h2>
            <p className="text-gray-600 mb-6">
              Sign in with your Google account to access your alumni profile and
              connect with other graduates.
            </p>
            <Link
              href="/login"
              className="inline-block bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition duration-200"
            >
              Alumni Login
            </Link>
          </div>

          {/* Admin Login */}
          <div className="bg-white rounded-lg shadow-xl p-8 text-center">
            <div className="mx-auto w-16 h-16 bg-indigo-600 rounded-full flex items-center justify-center mb-6">
              <Users className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Admin Access
            </h2>
            <p className="text-gray-600 mb-6">
              Administrative access for managing alumni records and portal
              content.
            </p>
            <Link
              href="/admin/login"
              className="inline-block bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition duration-200"
            >
              Admin Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
