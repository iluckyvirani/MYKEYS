/** Client-safe redirect sanitizer (no secrets). */
export function sanitizeRedirect(path: string | null | undefined) {
  if (!path || !path.startsWith("/") || path.startsWith("//")) return "/";
  return path;
}

export function googleAuthStartHref(redirect?: string) {
  const q = new URLSearchParams();
  if (redirect && redirect !== "/") {
    q.set("redirect", redirect);
  }
  const qs = q.toString();
  return qs ? `/api/auth/google?${qs}` : "/api/auth/google";
}
