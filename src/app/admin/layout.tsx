"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { MeResponse, UserDTO } from "@/types/auth";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
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

        const user = JSON.parse(storedUser) as UserDTO;

        // Check if user has ADMIN role
        if (!user.roles.includes("ADMIN")) {
          // Not an admin, redirect to home
          router.push("/");
          return;
        }

        // Verify with backend to ensure token is valid
        try {
          const response = await api.get<MeResponse>("/auth/me");
          if (response.data?.data) {
            const currentUser = response.data.data;
            if (!currentUser.roles.includes("ADMIN")) {
              router.push("/");
              return;
            }
            setIsAuthorized(true);
          }
        } catch (error) {
          // Token might be expired, redirect to admin login
          console.error("Auth verification failed:", error);
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
          localStorage.removeItem("user");
          router.push("/admin/login");
          return;
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
