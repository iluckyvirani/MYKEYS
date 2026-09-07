import { NextRequest } from "next/server";
import { withAuth, UserRole } from "@/lib/auth/middleware";
import {
  updatePropertyDocument,
  deletePropertyDocument,
} from "@/lib/documents/documentService";
import { successResponse, errorResponse } from "@/lib/response";
import { ErrorCode } from "@/lib/auth/errors";
import { prisma } from "@/lib/prisma";

async function assertOwnership(propertyId: string, ownerId: string) {
  const property = await prisma.property.findUnique({
    where: { id: propertyId },
    select: { id: true, ownerId: true },
  });
  if (!property || property.ownerId !== ownerId) return null;
  return property;
}

/**
 * PATCH /api/properties/[id]/documents/[docId]
 * Update a document (re-upload or change dates)
 */
export const PATCH = withAuth<{ id: string; docId: string }>(
  async (req, user, ctx) => {
    const property = await assertOwnership(ctx!.params.id, user!.userId);
    if (!property) {
      return errorResponse("Property not found", 404, ErrorCode.RESOURCE_NOT_FOUND);
    }

    const data = await req.json();

    try {
      const updated = await updatePropertyDocument(
        ctx!.params.docId,
        property.id,
        data
      );
      return successResponse(updated, "Document updated successfully");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to update document";
      return errorResponse(message, 404, ErrorCode.RESOURCE_NOT_FOUND);
    }
  },
  { roles: [UserRole.OWNER] }
);

/**
 * DELETE /api/properties/[id]/documents/[docId]
 * Remove a document
 */
export const DELETE = withAuth<{ id: string; docId: string }>(
  async (_req, user, ctx) => {
    const property = await assertOwnership(ctx!.params.id, user!.userId);
    if (!property) {
      return errorResponse("Property not found", 404, ErrorCode.RESOURCE_NOT_FOUND);
    }

    try {
      await deletePropertyDocument(ctx!.params.docId, property.id);
      return successResponse(null, "Document deleted successfully");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to delete document";
      return errorResponse(message, 404, ErrorCode.RESOURCE_NOT_FOUND);
    }
  },
  { roles: [UserRole.OWNER] }
);
