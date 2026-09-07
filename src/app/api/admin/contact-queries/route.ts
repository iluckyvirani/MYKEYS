import { NextRequest } from "next/server";
import { withAuth, UserRole } from "@/lib/auth/middleware";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/lib/response";
import { ErrorCode } from "@/lib/auth/errors";

export const GET = withAuth(
  async (request: NextRequest) => {
    try {
      const { searchParams } = new URL(request.url);
      const status = searchParams.get("status");
      const limitParam = parseInt(searchParams.get("limit") || "10", 10);
      const limit = Number.isFinite(limitParam) ? Math.max(1, Math.min(limitParam, 100)) : 10;

      const queries = await prisma.contactQuery.findMany({
        where: status && status !== "ALL" ? { status } : undefined,
        orderBy: { createdAt: "desc" },
        take: limit,
      });

      const total = await prisma.contactQuery.count();
      const open = await prisma.contactQuery.count({ where: { status: "NEW" } });

      return successResponse(
        {
          items: queries,
          summary: { total, open },
        },
        "Contact queries retrieved successfully"
      );
    } catch (error) {
      console.error("Get admin contact queries error:", error);
      return errorResponse(
        "Failed to retrieve contact queries",
        500,
        ErrorCode.INTERNAL_SERVER_ERROR
      );
    }
  },
  { roles: [UserRole.ADMIN] }
);
