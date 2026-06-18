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
        contactSupportEmail: settings.contactSupportEmail ?? "support@propertyplatform.com",
        contactSupportPhone: settings.contactSupportPhone ?? "+44 20 1234 5678",
        contactSupportDescription:
          settings.contactSupportDescription ??
          "Whether you're looking for a property, listing yours, or need support, our team is ready to assist you.",
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
