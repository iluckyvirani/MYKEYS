import { NextRequest, NextResponse } from "next/server";
import { getAppBaseUrl } from "@/lib/email/emailLayout";
import { unsubscribeFromNewsletter } from "@/lib/newsletter/service";

/**
 * GET /api/newsletter/unsubscribe?token=...
 * One-click unsubscribe from listing update emails.
 */
export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token") || "";
  const base = getAppBaseUrl();

  if (!token) {
    return NextResponse.redirect(`${base}/?newsletter=invalid`);
  }

  try {
    const ok = await unsubscribeFromNewsletter(token);
    return NextResponse.redirect(
      `${base}/?newsletter=${ok ? "unsubscribed" : "invalid"}`
    );
  } catch (error) {
    console.error("Newsletter unsubscribe error:", error);
    return NextResponse.redirect(`${base}/?newsletter=error`);
  }
}
