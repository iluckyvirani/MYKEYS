import { NextRequest } from "next/server";
import { successResponse, errorResponse } from "@/lib/response";
import { rentManagementService } from "@/lib/rent/rentManagementService";

/**
 * GET /api/cron/rent-due-reminders
 * Daily: email tenant + owner on rent due day; notify owner only.
 */
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return errorResponse("Unauthorized", 401);
  }

  try {
    const due = await rentManagementService.processRentDueReminders();
    const expired = await rentManagementService.processExpiredTenancies();
    return successResponse(
      { due, expired },
      "Rent due reminders and tenure endings processed"
    );
  } catch (error: any) {
    console.error("Rent due cron error:", error);
    return errorResponse(
      error.message || "Failed to process rent due reminders",
      500
    );
  }
}
