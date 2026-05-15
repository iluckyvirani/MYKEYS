import { NextRequest } from "next/server";
import { withAuth, UserRole } from "@/lib/auth/middleware";
import {
  getPropertyDocuments,
  upsertPropertyDocument,
} from "@/lib/documents/documentService";
import { successResponse, errorResponse } from "@/lib/response";
import { ErrorCode } from "@/lib/auth/errors";
import { prisma } from "@/lib/prisma";

/**
 * Verify the requesting owner owns the property.
 */
async function assertOwnership(propertyId: string, ownerId: string) {
  const property = await prisma.property.findUnique({
    where: { id: propertyId },
    select: { id: true, ownerId: true, listingType: true, rentalType: true },
  });
  if (!property) return null;
  if (property.ownerId !== ownerId) return null;
  return property;
}

/**
 * GET /api/properties/[id]/documents
 * List documents for a property (owner or admin)
 */
export const GET = withAuth<{ id: string }>(
  async (_req, user, ctx) => {
    // Admins can view all properties, owners can only view their own
    if (user!.role !== UserRole.ADMIN) {
      const property = await assertOwnership(ctx!.params.id, user!.userId);
      if (!property) {
        return errorResponse("Property not found", 404, ErrorCode.RESOURCE_NOT_FOUND);
      }
    }

    const docs = await getPropertyDocuments(ctx!.params.id);
    return successResponse(docs, "Documents retrieved successfully");
  },
  { roles: [UserRole.OWNER, UserRole.ADMIN] }
);

/**
 * POST /api/properties/[id]/documents
 * Upload / replace a document for a property (owner or admin)
 */
export const POST = withAuth<{ id: string }>(
  async (req, user, ctx) => {
    // Admins can manage all properties, owners can only manage their own
    if (user!.role !== UserRole.ADMIN) {
      const property = await assertOwnership(ctx!.params.id, user!.userId);
      if (!property) {
        return errorResponse("Property not found", 404, ErrorCode.RESOURCE_NOT_FOUND);
      }
    }

    const data = await req.json();

    if (
      !data.documentTypeId ||
      !data.documentUrl ||
      !data.fileName ||
      data.fileSize === undefined
    ) {
      return errorResponse(
        "documentTypeId, documentUrl, fileName, and fileSize are required",
        400,
        ErrorCode.VALIDATION_ERROR
      );
    }

    const doc = await upsertPropertyDocument(ctx!.params.id, {
      documentTypeId: data.documentTypeId,
      documentUrl: data.documentUrl,
      fileName: data.fileName,
      fileSize: data.fileSize,
      mimeType: data.mimeType,
      issuedDate: data.issuedDate,
      expiryDate: data.expiryDate,
    });

    return successResponse(doc, "Document uploaded successfully", 201);
  },
  { roles: [UserRole.OWNER, UserRole.ADMIN] }
);
