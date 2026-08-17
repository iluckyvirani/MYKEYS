import { NextRequest } from "next/server";
import { successResponse, errorResponse } from "@/lib/response";
import { verifyAccessToken } from "@/lib/auth/jwt";
import { serviceService } from "@/lib/services/serviceService";

/**
 * POST /api/user/service-bookings/[id]/verify-otp
 * Body: { otp: string }
 */
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const token =
      request.headers.get("authorization")?.replace("Bearer ", "") ||
      request.cookies.get("accessToken")?.value;
    if (!token) return errorResponse("Authentication required", 401);
    const payload = await verifyAccessToken(token);
    if (!payload) return errorResponse("Invalid token", 401);

    const { id } = await context.params;
    const body = await request.json();
    const otp = String(body.otp || "").trim();
    if (!/^\d{6}$/.test(otp)) {
      return errorResponse("Enter the 6-digit OTP", 400);
    }

    const booking = await serviceService.verifyBookingActionOtp(
      id,
      payload.userId,
      otp
    );
    return successResponse(booking, "Action confirmed");
  } catch (err: any) {
    return errorResponse(err.message || "Failed", 400);
  }
}
