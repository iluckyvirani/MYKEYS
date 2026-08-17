"use client";

import { useEffect, useState } from "react";
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

  useEffect(() => {
    // Login page: no gate, reset so next navigation re-checks
    if (pathname === "/admin/login") {
      setIsAuthorized(false);
      setIsLoading(false);
      return;
    }

    let cancelled = false;

    const checkAdminAccess = async () => {
      try {
        setIsLoading(true);

        const token = localStorage.getItem("accessToken");
        const storedUser = localStorage.getItem("user");

        if (!token || !storedUser) {
          router.replace("/admin/login");
          return;
        }

        let user: UserDTO;
        try {
          const parsedData = JSON.parse(storedUser);
          user = parsedData.data ? parsedData.data : parsedData;
        } catch {
          router.replace("/admin/login");
          return;
        }

        if (!user?.roles?.includes("ADMIN")) {
          router.replace("/");
          return;
        }

        // Fast path after fresh login / prior verify this tab
        if (sessionStorage.getItem("admin_auth_verified") === "true") {
          if (!cancelled) {
            setIsAuthorized(true);
            setIsLoading(false);
          }
          return;
        }

        try {
          const response = await api.get<MeResponse>("/auth/me");
          const currentUser = response.data?.data;
          if (currentUser && !currentUser.roles?.includes("ADMIN")) {
            router.replace("/");
            return;
          }
          sessionStorage.setItem("admin_auth_verified", "true");
          if (!cancelled) setIsAuthorized(true);
        } catch (error: any) {
          if (error?.response?.status === 401) {
            sessionStorage.removeItem("admin_auth_verified");
            localStorage.removeItem("accessToken");
            localStorage.removeItem("refreshToken");
            localStorage.removeItem("user");
            router.replace("/admin/login");
            return;
          }
          // Network / other errors: trust local ADMIN role for this session
          sessionStorage.setItem("admin_auth_verified", "true");
          if (!cancelled) setIsAuthorized(true);
        }
      } catch (error) {
        console.error("Authorization check failed:", error);
        router.replace("/admin/login");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    checkAdminAccess();

    return () => {
      cancelled = true;
    };
  }, [pathname, router]);

  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto" />
          <p className="mt-4 text-gray-600 font-medium">
            Verifying admin access...
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto" />
          <p className="mt-4 text-gray-600 font-medium">Redirecting…</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
