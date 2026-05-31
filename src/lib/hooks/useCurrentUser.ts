"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { getStoredUserFromLocalStorage } from "@/lib/auth/storedUser";
import { MeResponse, UserDTO } from "@/types/auth";

export function useCurrentUser() {
  const [user, setUser] = useState<UserDTO | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUser() {
      const stored = getStoredUserFromLocalStorage();
      if (stored?.firstName) {
        setUser(stored);
        setLoading(false);
        return;
      }

      try {
        const response = await api.get<MeResponse>("/auth/me");
        const userData = response.data?.data;
        if (userData) {
          setUser(userData);
          localStorage.setItem("user", JSON.stringify(userData));
        }
      } catch {
        // keep null — greeting falls back to generic name
      } finally {
        setLoading(false);
      }
    }

    loadUser();
  }, []);

  const firstName = user?.firstName?.trim() || "there";
  const fullName = user
    ? `${user.firstName} ${user.lastName}`.trim()
    : "User";

  return { user, firstName, fullName, loading };
}
