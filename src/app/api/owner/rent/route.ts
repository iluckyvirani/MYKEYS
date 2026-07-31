import { NextRequest } from "next/server";
import { RentTenure } from "@prisma/client";
import { successResponse, errorResponse } from "@/lib/response";
import { withAuth } from "@/lib/auth/middleware";
import { ErrorCode } from "@/lib/auth/errors";
import { JWTPayload } from "@/lib/auth/jwt";
import { rentManagementService } from "@/lib/rent/rentManagementService";

/**
 * GET /api/owner/rent
 * List tenancies + eligible long-term properties (no package required).
 */
export const GET = withAuth(async (_request: NextRequest, user: JWTPayload) => {
  try {
    const [tenancies, properties] = await Promise.all([
      rentManagementService.listOwnerTenancies(user.userId),
      rentManagementService.listEligibleProperties(user.userId),
    ]);

    return successResponse(
      { tenancies, properties },
      "Rent management data retrieved"
    );
  } catch (error: any) {
    console.error("Owner rent GET error:", error);
    return errorResponse(
      error.message || "Failed to load rent management",
      500,
      ErrorCode.INTERNAL_SERVER_ERROR
    );
  }
}, { roles: ["OWNER" as any, "ADMIN" as any] });

/**
 * POST /api/owner/rent
 * Create tenant + tenancy. If property was ACTIVE on website → DRAFT.
 * No active package required.
 */
export const POST = withAuth(async (request: NextRequest, user: JWTPayload) => {
  try {
    const body = await request.json();
    const tenancy = await rentManagementService.createTenancy(user.userId, {
      propertyId: body.propertyId,
      tenantName: body.tenantName,
      tenantEmail: body.tenantEmail,
      tenantPhone: body.tenantPhone,
      tenure: body.tenure as RentTenure,
      agreementDate: body.agreementDate,
      rentDueDay: Number(body.rentDueDay),
      monthlyRent: body.monthlyRent != null ? Number(body.monthlyRent) : null,
      documents: Array.isArray(body.documents) ? body.documents : [],
    });

    return successResponse(tenancy, "Tenant saved successfully", 201);
  } catch (error: any) {
    console.error("Owner rent POST error:", error);
    const status = error.status || 500;
    return errorResponse(
      error.message || "Failed to save tenant",
      status,
      status === 400
        ? ErrorCode.VALIDATION_ERROR
        : status === 404
          ? ErrorCode.RESOURCE_NOT_FOUND
          : ErrorCode.INTERNAL_SERVER_ERROR
    );
  }
}, { roles: ["OWNER" as any, "ADMIN" as any] });
