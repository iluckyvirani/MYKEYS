import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth, UserRole } from "@/lib/auth/middleware";
import { successResponse, errorResponse } from "@/lib/response";
import { ErrorCode } from "@/lib/auth/errors";
import { parseDepartmentBody } from "@/lib/contact/parseDepartmentBody";

export const PATCH = withAuth<{ id: string }>(
  async (request, _user, ctx) => {
    try {
      const existing = await prisma.contactDepartment.findUnique({
        where: { id: ctx!.params.id },
      });
      if (!existing) {
        return errorResponse("Department not found", 404, ErrorCode.RESOURCE_NOT_FOUND);
      }

      const body = await request.json();
      const parsed = parseDepartmentBody(body);
      if ("error" in parsed && parsed.error) {
        return errorResponse(parsed.error, 400, ErrorCode.VALIDATION_ERROR);
      }

      const department = await prisma.contactDepartment.update({
        where: { id: ctx!.params.id },
        data: parsed.data,
      });

      return successResponse(department, "Contact department updated successfully");
    } catch (error) {
      console.error("Update contact department error:", error);
      return errorResponse(
        "Failed to update contact department",
        500,
        ErrorCode.INTERNAL_SERVER_ERROR
      );
    }
  },
  { roles: [UserRole.ADMIN] }
);

export const DELETE = withAuth<{ id: string }>(
  async (_request, _user, ctx) => {
    try {
      const existing = await prisma.contactDepartment.findUnique({
        where: { id: ctx!.params.id },
      });
      if (!existing) {
        return errorResponse("Department not found", 404, ErrorCode.RESOURCE_NOT_FOUND);
      }

      await prisma.contactDepartment.delete({ where: { id: ctx!.params.id } });
      return successResponse(null, "Contact department deleted successfully");
    } catch (error) {
      console.error("Delete contact department error:", error);
      return errorResponse(
        "Failed to delete contact department",
        500,
        ErrorCode.INTERNAL_SERVER_ERROR
      );
    }
  },
  { roles: [UserRole.ADMIN] }
);
