import { NextRequest } from "next/server";
import { withAuth, UserRole } from "@/lib/auth/middleware";
import { successResponse, errorResponse } from "@/lib/response";
import { ErrorCode } from "@/lib/auth/errors";
import {
  ensurePageContentSeeded,
  getPageContent,
  isSitePage,
  upsertPageSection,
} from "@/lib/content/pageContent";
import { getSectionsForPage, SITE_PAGES } from "@/lib/content/siteDefaults";
import { prisma } from "@/lib/prisma";

export const GET = withAuth(
  async (
    _request: NextRequest,
    _user,
    context?: { params: { page: string } }
  ) => {
    try {
      const { page } = context!.params;
      if (!isSitePage(page)) {
        return errorResponse(
          `Invalid page. Allowed: ${SITE_PAGES.join(", ")}`,
          400,
          ErrorCode.VALIDATION_ERROR
        );
      }
      await ensurePageContentSeeded(page);
      const content = await getPageContent(page);
      const rows = await prisma.pageSection.findMany({
        where: { page },
        orderBy: { section: "asc" },
      });
      return successResponse(
        { content, rows, sections: getSectionsForPage(page) },
        "Page content retrieved successfully"
      );
    } catch (error) {
      console.error("Admin get page content error:", error);
      return errorResponse(
        "Failed to retrieve page content",
        500,
        ErrorCode.INTERNAL_SERVER_ERROR
      );
    }
  },
  { roles: [UserRole.ADMIN] }
);

export const PUT = withAuth(
  async (
    request: NextRequest,
    _user,
    context?: { params: { page: string } }
  ) => {
    try {
      const { page } = context!.params;
      if (!isSitePage(page)) {
        return errorResponse(
          `Invalid page. Allowed: ${SITE_PAGES.join(", ")}`,
          400,
          ErrorCode.VALIDATION_ERROR
        );
      }
      const body = await request.json();
      const section = body?.section as string | undefined;
      const content = body?.content;
      if (!section || !getSectionsForPage(page).includes(section)) {
        return errorResponse(
          `Invalid section. Allowed: ${getSectionsForPage(page).join(", ")}`,
          400,
          ErrorCode.VALIDATION_ERROR
        );
      }
      if (content === undefined || content === null) {
        return errorResponse(
          "content is required",
          400,
          ErrorCode.VALIDATION_ERROR
        );
      }
      const row = await upsertPageSection(page, section, content);
      const full = await getPageContent(page);
      return successResponse(
        { row, content: full },
        "Page content updated successfully"
      );
    } catch (error) {
      console.error("Admin update page content error:", error);
      return errorResponse(
        "Failed to update page content",
        500,
        ErrorCode.INTERNAL_SERVER_ERROR
      );
    }
  },
  { roles: [UserRole.ADMIN] }
);
