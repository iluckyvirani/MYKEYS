import { NextRequest, NextResponse } from "next/server";
import {
  exchangeGoogleCode,
  getGoogleOAuthConfig,
  loginOrRegisterWithGoogle,
  parseGoogleOAuthState,
  sanitizeRedirect,
} from "@/lib/auth/googleOAuth";

/**
 * GET /api/auth/google/callback
 * Google redirects here with ?code=&state=
 */
export async function GET(request: NextRequest) {
  const { appUrl } = getGoogleOAuthConfig();
  const loginError = (message: string) =>
    NextResponse.redirect(
      `${appUrl}/login?error=${encodeURIComponent(message)}`
    );

  try {
    const errorParam = request.nextUrl.searchParams.get("error");
    if (errorParam) {
      return loginError(
        errorParam === "access_denied"
          ? "Google Sign-In was cancelled"
          : `Google Sign-In failed: ${errorParam}`
      );
    }

    const code = request.nextUrl.searchParams.get("code");
    const state = request.nextUrl.searchParams.get("state");
    const parsedState = parseGoogleOAuthState(state);

    if (!code || !parsedState) {
      return loginError("Invalid Google Sign-In response. Please try again.");
    }

    const profile = await exchangeGoogleCode(code);
    const { accessToken, refreshToken } =
      await loginOrRegisterWithGoogle(profile);

    const redirect = sanitizeRedirect(parsedState.redirect);
    const completeUrl = new URL(`${appUrl}/auth/google/complete`);
    completeUrl.searchParams.set("redirect", redirect);

    const response = NextResponse.redirect(completeUrl.toString());

    response.cookies.set("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 15 * 60,
      path: "/",
    });
    response.cookies.set("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60,
      path: "/",
    });
    // Short-lived handoff for client localStorage (read once by /api/auth/google/session)
    response.cookies.set(
      "googleAuthHandoff",
      JSON.stringify({ accessToken, refreshToken }),
      {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 120,
        path: "/",
      }
    );

    return response;
  } catch (error) {
    console.error("Google OAuth callback error:", error);
    const message =
      error instanceof Error ? error.message : "Google Sign-In failed";
    if (message === "ACCOUNT_SUSPENDED") {
      return loginError("Your account has been suspended");
    }
    if (message === "ACCOUNT_INACTIVE") {
      return loginError("Your account is inactive");
    }
    return loginError("Google Sign-In failed. Please try again.");
  }
}
