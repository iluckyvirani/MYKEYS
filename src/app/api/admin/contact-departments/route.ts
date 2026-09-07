import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth, UserRole } from "@/lib/auth/middleware";
import { successResponse, errorResponse } from "@/lib/response";
import { ErrorCode } from "@/lib/auth/errors";
import { parseDepartmentBody } from "@/lib/contact/parseDepartmentBody";

export const GET = withAuth(
  async () => {
    try {
      const departments = await prisma.contactDepartment.findMany({
        orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
      });
      return successResponse(departments, "Contact departments retrieved successfully");
    } catch (error) {
      console.error("Admin get contact departments error:", error);
      return errorResponse(
        "Failed to retrieve contact departments",
        500,
        ErrorCode.INTERNAL_SERVER_ERROR
      );
    }
  },
  { roles: [UserRole.ADMIN] }
);

export const POST = withAuth(
  async (request: NextRequest) => {
    try {
      const body = await request.json();
      const parsed = parseDepartmentBody(body);
      if ("error" in parsed && parsed.error) {
        return errorResponse(parsed.error, 400, ErrorCode.VALIDATION_ERROR);
      }

      const department = await prisma.contactDepartment.create({ data: parsed.data });
      return successResponse(department, "Contact department created successfully", 201);
    } catch (error) {
      console.error("Create contact department error:", error);
      return errorResponse(
        "Failed to create contact department",
        500,
        ErrorCode.INTERNAL_SERVER_ERROR
      );
    }
  },
  { roles: [UserRole.ADMIN] }
);
