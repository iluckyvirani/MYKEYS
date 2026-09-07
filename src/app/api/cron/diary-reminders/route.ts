import { NextRequest } from "next/server";
import { successResponse, errorResponse } from "@/lib/response";
import { diaryService } from "@/lib/diary/diaryService";

/**
 * GET /api/cron/diary-reminders
 * Daily: email + notification for diary items due today.
 */
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return errorResponse("Unauthorized", 401);
  }

  try {
    const result = await diaryService.processDueReminders();
    return successResponse(result, "Diary reminders processed");
  } catch (error: any) {
    console.error("Diary reminder cron error:", error);
    return errorResponse(
      error.message || "Failed to process diary reminders",
      500
    );
  }
}
