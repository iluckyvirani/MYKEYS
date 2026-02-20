"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to appropriate dashboard based on user role
    // For now, check if user is logged in and redirect
    const checkAuth = async () => {
      try {
        const response = await fetch("/api/auth/me");
        
        if (response.ok) {
          const data = await response.json();
          const user = data.data;
          
          // Redirect based on role (check in order: SERVICE, OWNER, USER)
          if (user.role === "SERVICE") {
            router.push("/service/dashboard");
          } else if (user.role === "OWNER" || user.role === "ADMIN") {
            router.push("/owner/dashboard");
          } else {
            router.push("/user/dashboard");
          }
        } else {
          // Not authenticated, redirect to login
          router.push("/login?redirect=/dashboard");
        }
      } catch (error) {
        console.error("Auth check failed:", error);
        router.push("/login?redirect=/dashboard");
      }
    };

    checkAuth();
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading dashboard...</p>
      </div>
    </div>
  );
}
