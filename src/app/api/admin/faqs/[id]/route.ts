import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth, UserRole } from "@/lib/auth/middleware";
import { successResponse, errorResponse } from "@/lib/response";
import { ErrorCode } from "@/lib/auth/errors";
import { parseFaqBody } from "@/lib/faq/parseFaqBody";

export const GET = withAuth<{ id: string }>(
  async (_request, _user, ctx) => {
    try {
      const faq = await prisma.faq.findUnique({ where: { id: ctx!.params.id } });
      if (!faq) {
        return errorResponse("FAQ not found", 404, ErrorCode.RESOURCE_NOT_FOUND);
      }
      return successResponse(faq, "FAQ retrieved successfully");
    } catch (error) {
      console.error("Get FAQ error:", error);
      return errorResponse("Failed to retrieve FAQ", 500, ErrorCode.INTERNAL_SERVER_ERROR);
    }
  },
  { roles: [UserRole.ADMIN] }
);

export const PATCH = withAuth<{ id: string }>(
  async (request, _user, ctx) => {
    try {
      const existing = await prisma.faq.findUnique({ where: { id: ctx!.params.id } });
      if (!existing) {
        return errorResponse("FAQ not found", 404, ErrorCode.RESOURCE_NOT_FOUND);
      }

      const body = await request.json();
      const parsed = parseFaqBody(body);
      if ("error" in parsed && parsed.error) {
        return errorResponse(parsed.error, 400, ErrorCode.VALIDATION_ERROR);
      }

      const faq = await prisma.faq.update({
        where: { id: ctx!.params.id },
        data: parsed.data,
      });

      return successResponse(faq, "FAQ updated successfully");
    } catch (error) {
      console.error("Update FAQ error:", error);
      return errorResponse("Failed to update FAQ", 500, ErrorCode.INTERNAL_SERVER_ERROR);
    }
  },
  { roles: [UserRole.ADMIN] }
);

export const DELETE = withAuth<{ id: string }>(
  async (_request, _user, ctx) => {
    try {
      const existing = await prisma.faq.findUnique({ where: { id: ctx!.params.id } });
      if (!existing) {
        return errorResponse("FAQ not found", 404, ErrorCode.RESOURCE_NOT_FOUND);
      }

      await prisma.faq.delete({ where: { id: ctx!.params.id } });
      return successResponse(null, "FAQ deleted successfully");
    } catch (error) {
      console.error("Delete FAQ error:", error);
      return errorResponse("Failed to delete FAQ", 500, ErrorCode.INTERNAL_SERVER_ERROR);
    }
  },
  { roles: [UserRole.ADMIN] }
);
