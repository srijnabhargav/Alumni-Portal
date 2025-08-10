// contexts/AdminContext.tsx
"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

interface Admin {
  id: string;
  username: string;
}

interface AdminContextType {
  admin: Admin | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export function AdminProvider({ children }: { children: ReactNode }) {
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check authentication status on mount
  useEffect(() => {
    console.log("AdminProvider: Checking auth status...");
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      console.log("AdminProvider: Making verify request...");
      const response = await fetch("/api/auth/admin/verify");
      console.log("AdminProvider: Verify response:", response.status);

      if (response.ok) {
        const data = await response.json();
        console.log("AdminProvider: Admin data:", data);
        setAdmin(data.admin);
      } else {
        console.log("AdminProvider: Verification failed");
      }
    } catch (error) {
      console.error("AdminProvider: Auth check failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (
    username: string,
    password: string,
  ): Promise<boolean> => {
    try {
      console.log("AdminProvider: Attempting login for:", username);
      const response = await fetch("/api/auth/admin/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      console.log("AdminProvider: Login response:", response.status);

      if (response.ok) {
        const data = await response.json();
        console.log("AdminProvider: Login success:", data);

        // Update state and return success
        setAdmin(data.admin);

        // Force a small delay to ensure state is updated
        await new Promise((resolve) => setTimeout(resolve, 100));

        return true;
      } else {
        const errorData = await response.json();
        console.error("AdminProvider: Login failed:", errorData);
      }
      return false;
    } catch (error) {
      console.error("AdminProvider: Login error:", error);
      return false;
    }
  };

  const logout = async () => {
    try {
      console.log("AdminProvider: Logging out...");
      await fetch("/api/auth/admin/logout", { method: "POST" });
      setAdmin(null);
    } catch (error) {
      console.error("AdminProvider: Logout failed:", error);
    }
  };

  console.log("AdminProvider: Current state:", {
    admin,
    isLoading,
    isAuthenticated: !!admin,
  });

  return (
    <AdminContext.Provider
      value={{
        admin,
        isAuthenticated: !!admin,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
}

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error("useAdmin must be used within an AdminProvider");
  }
  return context;
};
