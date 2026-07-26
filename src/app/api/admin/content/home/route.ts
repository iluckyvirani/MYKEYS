import { NextRequest } from "next/server";
import { withAuth, UserRole } from "@/lib/auth/middleware";
import { successResponse, errorResponse } from "@/lib/response";
import { ErrorCode } from "@/lib/auth/errors";
import {
  ensureHomeContentSeeded,
  getHomeContent,
  upsertHomeSection,
} from "@/lib/content/homeContent";
import { HOME_SECTIONS, HomeSectionKey } from "@/lib/content/homeDefaults";
import { prisma } from "@/lib/prisma";

export const GET = withAuth(
  async () => {
    try {
      await ensureHomeContentSeeded();
      const content = await getHomeContent();
      const rows = await prisma.pageSection.findMany({
        where: { page: "home" },
        orderBy: { section: "asc" },
      });
      return successResponse(
        { content, rows },
        "Home content retrieved successfully"
      );
    } catch (error) {
      console.error("Admin get home content error:", error);
      return errorResponse(
        "Failed to retrieve home content",
        500,
        ErrorCode.INTERNAL_SERVER_ERROR
      );
    }
  },
  { roles: [UserRole.ADMIN] }
);

export const PUT = withAuth(
  async (request: NextRequest) => {
    try {
      const body = await request.json();
      const section = body?.section as string | undefined;
      const content = body?.content;

      if (!section || !HOME_SECTIONS.includes(section as HomeSectionKey)) {
        return errorResponse(
          `Invalid section. Allowed: ${HOME_SECTIONS.join(", ")}`,
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

      const row = await upsertHomeSection(section as HomeSectionKey, content);
      const full = await getHomeContent();
      return successResponse(
        { row, content: full },
        "Home content updated successfully"
      );
    } catch (error) {
      console.error("Admin update home content error:", error);
      return errorResponse(
        "Failed to update home content",
        500,
        ErrorCode.INTERNAL_SERVER_ERROR
      );
    }
  },
  { roles: [UserRole.ADMIN] }
);
