import { NextRequest, NextResponse } from "next/server";
import {
  buildGoogleAuthUrl,
  getGoogleOAuthConfig,
  sanitizeRedirect,
} from "@/lib/auth/googleOAuth";

/**
 * GET /api/auth/google
 * Start Google OAuth — redirects to Google consent screen.
 * Query: ?redirect=/path (optional post-login destination)
 */
export async function GET(request: NextRequest) {
  try {
    const { configured } = getGoogleOAuthConfig();
    if (!configured) {
      const appUrl = (
        process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
      ).replace(/\/$/, "");
      return NextResponse.redirect(
        `${appUrl}/login?error=${encodeURIComponent(
          "Google Sign-In is not configured. Add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET."
        )}`
      );
    }

    const redirect = sanitizeRedirect(
      request.nextUrl.searchParams.get("redirect") || "/"
    );
    const url = buildGoogleAuthUrl({ redirect });
    return NextResponse.redirect(url);
  } catch (error) {
    console.error("Google OAuth start error:", error);
    const appUrl = (
      process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
    ).replace(/\/$/, "");
    return NextResponse.redirect(
      `${appUrl}/login?error=${encodeURIComponent(
        "Could not start Google Sign-In"
      )}`
    );
  }
}
