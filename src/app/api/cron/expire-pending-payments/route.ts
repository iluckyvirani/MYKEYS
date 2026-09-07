import { NextRequest } from "next/server";
import { paymentService } from "@/lib/payments/paymentService";
import { successResponse, errorResponse } from "@/lib/response";

/**
 * GET /api/cron/expire-pending-payments
 * Marks checkout / PaymentIntents still pending after 5 minutes as failed.
 */
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return errorResponse("Unauthorized", 401);
  }

  try {
    const result = await paymentService.expireStalePendingTransactions();
    return successResponse(result, "Stale pending transactions expired");
  } catch (err) {
    console.error("[cron/expire-pending-payments]", err);
    return errorResponse("Internal server error", 500);
  }
}
