"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { api } from "@/lib/api";
import { MeResponse, UserDTO } from "@/types/auth";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const authChecked = useRef(false);

  useEffect(() => {
    // Skip auth check for login page (render-level check handles display)
    if (pathname === "/admin/login") {
      setIsLoading(false);
      return;
    }

    // Prevent re-verification on every navigation (pathname change)
    if (authChecked.current) return;
    authChecked.current = true;

    const checkAdminAccess = async () => {
      try {
        setIsLoading(true);

        // Get stored token
        const token = localStorage.getItem("accessToken");
        if (!token) {
          router.push("/admin/login");
          return;
        }

        // Get the stored user data
        const storedUser = localStorage.getItem("user");
        if (!storedUser) {
          router.push("/admin/login");
          return;
        }

        let user: UserDTO;
        try {
          const parsedData = JSON.parse(storedUser);
          // Handle both direct user object and response wrapper
          user = parsedData.data ? parsedData.data : parsedData;
        } catch (parseError) {
          console.error("Failed to parse stored user:", parseError);
          router.push("/admin/login");
          return;
        }

        // Check if user has ADMIN role
        if (!user || !user.roles || !user.roles.includes("ADMIN")) {
          router.push("/");
          return;
        }

        // If ProtectAdminRoute already verified this session, skip the API call
        if (sessionStorage.getItem("admin_auth_verified") === "true") {
          setIsAuthorized(true);
          setIsLoading(false);
          return;
        }

        // Verify with backend to ensure token is still valid
        try {
          const response = await api.get<MeResponse>("/auth/me");
          if (response.data?.data) {
            const currentUser = response.data.data;
            if (!currentUser.roles || !currentUser.roles.includes("ADMIN")) {
              router.push("/");
              return;
            }
            sessionStorage.setItem("admin_auth_verified", "true");
            setIsAuthorized(true);
          } else {
            sessionStorage.setItem("admin_auth_verified", "true");
            setIsAuthorized(true);
          }
        } catch (error: any) {
          if (error?.response?.status === 401) {
            console.error("Token expired");
            sessionStorage.removeItem("admin_auth_verified");
            localStorage.removeItem("accessToken");
            localStorage.removeItem("refreshToken");
            localStorage.removeItem("user");
            router.push("/admin/login");
            return;
          }
          console.error("Auth verification failed:", error);
          setIsAuthorized(true);
        }
      } catch (error) {
        console.error("Authorization check failed:", error);
        router.push("/admin/login");
      } finally {
        setIsLoading(false);
      }
    };

    checkAdminAccess();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Allow login page to render without auth check
  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">Verifying admin access...</p>
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    return null; // Will redirect via useEffect
  }

  return <>{children}</>;
}
