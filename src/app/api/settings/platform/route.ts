import { packageService } from "@/lib/packages/packageService";
import { successResponse, errorResponse } from "@/lib/response";
import { ErrorCode } from "@/lib/auth/errors";

/**
 * GET /api/settings/platform
 * Public read-only platform settings for owners (e.g. short rent commission).
 */
export async function GET() {
  try {
    const settings = await packageService.getAdminSettings();
    return successResponse(
      {
        shortRentCommissionPercent: settings.shortRentCommissionPercent ?? 0,
      },
      "Platform settings retrieved"
    );
  } catch (error) {
    console.error("Get platform settings error:", error);
    return errorResponse(
      "Failed to load platform settings",
      500,
      ErrorCode.INTERNAL_SERVER_ERROR
    );
  }
}
