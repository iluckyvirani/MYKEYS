import { NextRequest, NextResponse } from "next/server";
import { successResponse, errorResponse } from "@/lib/response";
import { ErrorCode } from "@/lib/auth/errors";

/**
 * POST /api/auth/logout
 * Logout user by clearing authentication cookies
 */
export async function POST(request: NextRequest) {
  try {
    // Create response
    const response = successResponse(null, "Logout successful");

    // Clear authentication cookies
    response.cookies.set("accessToken", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 0,
      path: "/",
    });

    response.cookies.set("refreshToken", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 0,
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Logout error:", error);
    return errorResponse(
      "Logout failed. Please try again.",
      500,
      ErrorCode.INTERNAL_SERVER_ERROR
    );
  }
}
