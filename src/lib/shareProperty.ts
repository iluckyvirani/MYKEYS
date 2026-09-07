/**
 * Public listing URL + Web Share / clipboard helper
 */

export function getPublicPropertyUrl(propertyId: string): string {
  const origin =
    typeof window !== "undefined"
      ? window.location.origin
      : (process.env.NEXT_PUBLIC_APP_URL || process.env.FRONTEND_URL || "").replace(
          /\/$/,
          ""
        );
  return `${origin}/property/${propertyId}`;
}

export type SharePropertyResult = "shared" | "copied" | "cancelled" | "failed";

export async function sharePropertyListing(opts: {
  id: string;
  title: string;
  text?: string;
}): Promise<SharePropertyResult> {
  const url = getPublicPropertyUrl(opts.id);
  const title = opts.title || "Property on MYKEYS";
  const text = opts.text || `Check out this property on MYKEYS: ${title}`;

  try {
    if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
      await navigator.share({ title, text, url });
      return "shared";
    }
  } catch (err: any) {
    if (err?.name === "AbortError") return "cancelled";
  }

  try {
    if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(url);
      return "copied";
    }
  } catch {
    /* fall through */
  }

  return "failed";
}
