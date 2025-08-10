"use client";

import { useSession, signOut } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function AuthNavigation() {
  const { data: session, status } = useSession();
  const pathname = usePathname();

  // Don't show navigation on auth pages
  if (pathname === "/login" || pathname === "/unauthorized") {
    return null;
  }

  return (
    <nav className="bg-blue-600 text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        {/* // add logo here  */}
        <div className="flex items-center space-x-3">
          <Image
            src="/rcewlogo.jpg"
            alt="RCEW Logo"
            width={40}
            height={40}
            className="rounded-4xl"
          />
          <h1 className="text-xl font-bold">RCEW Alumni Network</h1>
        </div>

        <div className="flex items-center space-x-4">
          {status === "loading" ? (
            <div className="animate-pulse">Loading...</div>
          ) : status === "authenticated" ? (
            <>
              <Link href="/alumni" className="hover:text-blue-200">
                Alumni Directory
              </Link>
              <Link href="/dashboard" className="hover:text-blue-200">
                Profile
              </Link>

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
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="bg-blue-700 hover:bg-blue-800 px-3 py-1 rounded text-sm transition duration-200"
                >
                  Sign Out
                </button>
              </div>
            </>
          ) : (
            // <Link
            //   href="/admin/login"
            //   className="bg-blue-700 hover:bg-blue-800 px-4 py-2 rounded transition duration-200"
            // >
            //   Admin
            // </Link>
            <></>
          )}
        </div>
      </div>
    </nav>
  );
}
