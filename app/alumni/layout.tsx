"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import AuthNavigation from "@/components/AuthNavigation";

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Redirect to user login if not authenticated
    if (status === "unauthenticated") {
      router.push("/");
      return;
    }

    // Handle authenticated users with profile status routing
    if (status === "authenticated" && session?.user) {
      const profileStatus = (session.user as any).profileStatus;

      // Route based on profile status (middleware will also handle this)
      if (pathname === "/profile") {
        if (profileStatus === "approved") {
          router.push("/dashboard");
        } else if (profileStatus === "blocked") {
          router.push("/unauthorized");
        }
      }
    }
  }, [status, session, pathname, router]);

  // Show loading for protected user routes
  if (
    pathname !== "/login" &&
    pathname !== "/unauthorized" &&
    status === "loading"
  ) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading user session...</p>
        </div>
      </div>
    );
  }

  // Don't render protected content if not authenticated
  if (
    pathname !== "/login" &&
    pathname !== "/unauthorized" &&
    status === "unauthenticated"
  ) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AuthNavigation />
      {children}
    </div>
  );
}
