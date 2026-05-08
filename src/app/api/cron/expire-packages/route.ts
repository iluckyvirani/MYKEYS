import { NextRequest, NextResponse } from "next/server";
import { packageService } from "@/lib/packages/packageService";
import { successResponse, errorResponse } from "@/lib/response";

export async function GET(req: NextRequest) {
  // Verify cron secret to prevent unauthorized access
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return errorResponse("Unauthorized", 401);
  }

  try {
    const result = await packageService.expirePackages();
    return successResponse(result, "Package expiry job completed");
  } catch (err: any) {
    console.error("[cron/expire-packages]", err);
    return errorResponse("Internal server error", 500);
  }
}
