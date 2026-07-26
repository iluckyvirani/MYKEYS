import { NextRequest } from "next/server";
import { processSavedSearchAlerts } from "@/lib/savedSearches/alertProcessor";
import { successResponse, errorResponse } from "@/lib/response";

/**
 * GET /api/cron/saved-search-alerts
 * Hourly cron: email users about new listings matching their saved searches.
 * Secured by CRON_SECRET env var.
 */
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return errorResponse("Unauthorized", 401);
  }

  try {
    const result = await processSavedSearchAlerts();
    return successResponse(result, "Saved search alerts processed");
  } catch (err: unknown) {
    console.error("[cron/saved-search-alerts]", err);
    return errorResponse("Internal server error", 500);
  }
}
