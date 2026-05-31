import { UserDTO } from "@/types/auth";

/**
 * Read logged-in user from localStorage (client-safe — no server imports)
 */
export function getStoredUserFromLocalStorage(): UserDTO | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem("user");
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as UserDTO | { data?: UserDTO };
    if (parsed && typeof parsed === "object" && "data" in parsed && parsed.data) {
      return parsed.data;
    }
    return parsed as UserDTO;
  } catch {
    return null;
  }
}
