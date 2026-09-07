"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { getStoredUserFromLocalStorage, setStoredUser } from "@/lib/auth/storedUser";
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
      }

      try {
        const response = await api.get<MeResponse>("/auth/me");
        const userData = response.data?.data;
        if (userData) {
          setUser(userData);
          setStoredUser(userData);
        }
      } catch {
        // keep stored / null
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
