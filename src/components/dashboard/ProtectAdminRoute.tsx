"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { MeResponse, UserDTO } from "@/types/auth";

const ADMIN_AUTH_CACHE_KEY = "admin_auth_verified";

interface ProtectAdminRouteProps {
  children: React.ReactNode;
}

export default function ProtectAdminRoute({ children }: ProtectAdminRouteProps) {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAdminAccess = async () => {
      try {
        // If already verified this session, skip the API call entirely
        const cached = sessionStorage.getItem(ADMIN_AUTH_CACHE_KEY);
        if (cached === "true") {
          setIsAuthorized(true);
          setIsLoading(false);
          return;
        }

        setIsLoading(true);

        // Get the stored user data first
        const storedUser = localStorage.getItem("user");
        const token = localStorage.getItem("accessToken");
        
        if (!storedUser || !token) {
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

        // Verify with backend to ensure token is still valid
        try {
          const response = await api.get<MeResponse>("/auth/me");
          if (response.data?.data) {
            const currentUser = response.data.data;
            if (!currentUser.roles || !currentUser.roles.includes("ADMIN")) {
              router.push("/");
              return;
            }
            sessionStorage.setItem(ADMIN_AUTH_CACHE_KEY, "true");
            setIsAuthorized(true);
          } else {
            sessionStorage.setItem(ADMIN_AUTH_CACHE_KEY, "true");
            setIsAuthorized(true);
          }
        } catch (error: any) {
          // If token is expired or invalid
          if (error?.response?.status === 401) {
            console.error("Token expired or invalid");
            sessionStorage.removeItem(ADMIN_AUTH_CACHE_KEY);
            localStorage.removeItem("accessToken");
            localStorage.removeItem("refreshToken");
            localStorage.removeItem("user");
            router.push("/admin/login");
            return;
          }
          // For other errors, still allow access if locally authorized
          console.error("Auth verification failed:", error);
          sessionStorage.setItem(ADMIN_AUTH_CACHE_KEY, "true");
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
  }, [router]);

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
