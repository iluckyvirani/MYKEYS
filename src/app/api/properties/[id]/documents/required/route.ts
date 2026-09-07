import { NextRequest } from "next/server";
import { getRequiredDocumentTypes } from "@/lib/documents/documentService";
import { successResponse, errorResponse } from "@/lib/response";
import { ErrorCode } from "@/lib/auth/errors";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/properties/[id]/documents/required
 * Returns required document types for this property's listing type.
 * Public endpoint — used by the property form to show what's needed.
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const property = await prisma.property.findUnique({
    where: { id },
    select: { listingType: true, rentalType: true },
  });

  if (!property) {
    return errorResponse("Property not found", 404, ErrorCode.RESOURCE_NOT_FOUND);
  }

  const required = await getRequiredDocumentTypes(
    property.listingType,
    property.rentalType
  );

  return successResponse(required, "Required document types retrieved successfully");
}
