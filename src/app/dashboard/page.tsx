"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getPrimaryDashboardPath, setStoredUser } from "@/lib/auth/storedUser";

/**
 * /dashboard — route multi-role users to the best dashboard.
 * Prefer OWNER when the user is both tenant and landlord.
 */
export default function DashboardPage() {
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch("/api/auth/me", { credentials: "include" });

        if (response.ok) {
          const data = await response.json();
          const user = data.data;
          if (user) {
            setStoredUser(user);
            router.replace(getPrimaryDashboardPath(user));
            return;
          }
        }
        router.replace("/login?redirect=/dashboard");
      } catch (error) {
        console.error("Auth check failed:", error);
        router.replace("/login?redirect=/dashboard");
      }
    };

    checkAuth();
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto" />
        <p className="mt-4 text-gray-600">Loading dashboard...</p>
      </div>
    </div>
  );
}
