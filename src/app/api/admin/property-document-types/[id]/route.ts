import { NextRequest } from "next/server";
import { withAuth, UserRole } from "@/lib/auth/middleware";
import {
  getDocumentTypeById,
  updateDocumentType,
  deleteDocumentType,
} from "@/lib/documents/documentService";
import { successResponse, errorResponse } from "@/lib/response";
import { ErrorCode } from "@/lib/auth/errors";

/**
 * GET /api/admin/property-document-types/[id]
 */
export const GET = withAuth<{ id: string }>(
  async (_req, _user, ctx) => {
    const docType = await getDocumentTypeById(ctx!.params.id);
    if (!docType) {
      return errorResponse(
        "Document type not found",
        404,
        ErrorCode.RESOURCE_NOT_FOUND
      );
    }
    return successResponse(docType, "Document type retrieved successfully");
  },
  { roles: [UserRole.ADMIN] }
);

/**
 * PATCH /api/admin/property-document-types/[id]
 */
export const PATCH = withAuth<{ id: string }>(
  async (req, _user, ctx) => {
    const data = await req.json();

    const validAppliesTo = ["ALL", "BUY", "RENT_LONG", "RENT_SHORT"];
    if (Array.isArray(data.appliesTo)) {
      const invalid = data.appliesTo.filter(
        (v: unknown) => typeof v !== "string" || !validAppliesTo.includes(v)
      );
      if (invalid.length > 0) {
        return errorResponse(
          `Invalid appliesTo values: ${invalid.join(", ")}`,
          400,
          ErrorCode.VALIDATION_ERROR
        );
      }
    }

    try {
      const updated = await updateDocumentType(ctx!.params.id, data);
      return successResponse(updated, "Document type updated successfully");
    } catch {
      return errorResponse(
        "Document type not found",
        404,
        ErrorCode.RESOURCE_NOT_FOUND
      );
    }
  },
  { roles: [UserRole.ADMIN] }
);

/**
 * DELETE /api/admin/property-document-types/[id]
 */
export const DELETE = withAuth<{ id: string }>(
  async (_req, _user, ctx) => {
    try {
      await deleteDocumentType(ctx!.params.id);
      return successResponse(null, "Document type deleted successfully");
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to delete document type";
      return errorResponse(message, 400, ErrorCode.VALIDATION_ERROR);
    }
  },
  { roles: [UserRole.ADMIN] }
);
