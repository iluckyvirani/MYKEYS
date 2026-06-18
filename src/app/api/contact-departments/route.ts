import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/lib/response";
import { ErrorCode } from "@/lib/auth/errors";

export async function GET() {
  try {
    const departments = await prisma.contactDepartment.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    });

    return successResponse(departments, "Contact departments retrieved successfully");
  } catch (error) {
    console.error("Get contact departments error:", error);
    return errorResponse(
      "Failed to retrieve contact departments",
      500,
      ErrorCode.INTERNAL_SERVER_ERROR
    );
  }
}
