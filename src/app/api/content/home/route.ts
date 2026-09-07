import { getHomeContent } from "@/lib/content/homeContent";
import { successResponse, errorResponse } from "@/lib/response";
import { ErrorCode } from "@/lib/auth/errors";

/**
 * GET /api/content/home
 * Public homepage CMS content (with seeded defaults).
 */
export async function GET() {
  try {
    const content = await getHomeContent();
    return successResponse(content, "Home content retrieved successfully");
  } catch (error) {
    console.error("Get home content error:", error);
    return errorResponse(
      "Failed to retrieve home content",
      500,
      ErrorCode.INTERNAL_SERVER_ERROR
    );
  }
}
