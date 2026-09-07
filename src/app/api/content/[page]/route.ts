import { NextRequest } from "next/server";
import { successResponse, errorResponse } from "@/lib/response";
import { ErrorCode } from "@/lib/auth/errors";
import { getPageContent, isSitePage } from "@/lib/content/pageContent";
import { SITE_PAGES } from "@/lib/content/siteDefaults";

/**
 * GET /api/content/[page]
 * Public CMS content for about | contact | privacy | terms | cookies
 */
export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ page: string }> }
) {
  try {
    const { page } = await context.params;
    if (!isSitePage(page)) {
      return errorResponse(
        `Invalid page. Allowed: ${SITE_PAGES.join(", ")}`,
        400,
        ErrorCode.VALIDATION_ERROR
      );
    }
    const content = await getPageContent(page);
    return successResponse(content, "Page content retrieved successfully");
  } catch (error) {
    console.error("Get page content error:", error);
    return errorResponse(
      "Failed to retrieve page content",
      500,
      ErrorCode.INTERNAL_SERVER_ERROR
    );
  }
}
