import { UserDTO } from "@/types/auth";

/**
 * Read logged-in user from localStorage (client-safe — no server imports).
 * Handles both a plain UserDTO and a mistaken wrapped `{ data: UserDTO }` payload.
 */
export function getStoredUserFromLocalStorage(): UserDTO | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem("user");
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as UserDTO | { data?: UserDTO; success?: boolean };
    if (parsed && typeof parsed === "object" && "data" in parsed && parsed.data) {
      return parsed.data as UserDTO;
    }
    return parsed as UserDTO;
  } catch {
    return null;
  }
}

/** Persist a clean UserDTO and notify listeners (Navbar / RoleSwitcher). */
export function setStoredUser(user: UserDTO) {
  if (typeof window === "undefined") return;
  localStorage.setItem("user", JSON.stringify(user));
  window.dispatchEvent(new Event("mykeys:user-updated"));
}

export function userHasRole(
  user: UserDTO | null | undefined,
  role: string
): boolean {
  return Boolean(user?.roles?.some((r) => r === role));
}

export function getPrimaryDashboardPath(user: UserDTO | null | undefined): string {
  const roles = user?.roles ?? [];
  if (roles.includes("ADMIN")) return "/admin/dashboard";
  if (roles.includes("OWNER")) return "/owner/dashboard";
  if (roles.includes("SERVICE")) return "/service/dashboard";
  return "/user/dashboard";
}
