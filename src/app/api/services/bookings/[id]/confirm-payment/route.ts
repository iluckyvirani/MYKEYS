import { NextRequest } from "next/server";
import { successResponse, errorResponse } from "@/lib/response";
import { verifyAccessToken } from "@/lib/auth/jwt";
import { serviceService } from "@/lib/services/serviceService";

/**
 * POST /api/services/bookings/[id]/confirm-payment
 * Mark service booking paid after Stripe succeeds.
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
    const body = await request.json().catch(() => ({}));
    const booking = await serviceService.markBookingPaid(
      id,
      payload.userId,
      body.stripePaymentIntentId
    );
    return successResponse(booking, "Payment confirmed");
  } catch (err: any) {
    return errorResponse(err.message || "Failed", 400);
  }
}
