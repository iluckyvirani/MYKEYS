"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { MeResponse, UserDTO } from "@/types/auth";

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
        setIsLoading(true);

        // Get the stored user data first
        const storedUser = localStorage.getItem("user");
        if (!storedUser) {
          router.push("/admin/login");
          return;
        }

        const user = JSON.parse(storedUser) as UserDTO;

        // Check if user has ADMIN role
        if (!user.roles.includes("ADMIN")) {
          router.push("/");
          return;
        }

        // Optional: Verify with backend
        try {
          const response = await api.get<MeResponse>("/auth/me");
          if (response.data?.data) {
            const currentUser = response.data.data;
            if (!currentUser.roles.includes("ADMIN")) {
              router.push("/");
              return;
            }
          }
        } catch (error) {
          // If auth verification fails, redirect to login
          console.error("Auth verification failed:", error);
          router.push("/admin/login");
          return;
        }

        setIsAuthorized(true);
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
