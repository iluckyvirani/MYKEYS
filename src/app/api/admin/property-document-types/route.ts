import { NextRequest } from "next/server";
import { withAuth, UserRole } from "@/lib/auth/middleware";
import {
  getAllDocumentTypes,
  createDocumentType,
} from "@/lib/documents/documentService";
import { successResponse, errorResponse } from "@/lib/response";
import { ErrorCode } from "@/lib/auth/errors";

/**
 * GET /api/admin/property-document-types
 * List all document types (admin only)
 */
export const GET = withAuth(
  async (_req: NextRequest) => {
    const types = await getAllDocumentTypes();
    return successResponse(types, "Document types retrieved successfully");
  },
  { roles: [UserRole.ADMIN] }
);

/**
 * POST /api/admin/property-document-types
 * Create a document type (admin only)
 */
export const POST = withAuth(
  async (req: NextRequest) => {
    const data = await req.json();

    if (!data.name || typeof data.name !== "string" || !data.name.trim()) {
      return errorResponse(
        "name is required",
        400,
        ErrorCode.VALIDATION_ERROR
      );
    }

    if (
      data.appliesTo !== undefined &&
      !Array.isArray(data.appliesTo)
    ) {
      return errorResponse(
        "appliesTo must be an array",
        400,
        ErrorCode.VALIDATION_ERROR
      );
    }

    const validAppliesTo = ["ALL", "BUY", "RENT_LONG", "RENT_SHORT"];
    if (Array.isArray(data.appliesTo)) {
      const invalid = data.appliesTo.filter(
        (v: unknown) => typeof v !== "string" || !validAppliesTo.includes(v)
      );
      if (invalid.length > 0) {
        return errorResponse(
          `Invalid appliesTo values: ${invalid.join(", ")}. Use ALL, BUY, RENT_LONG, or RENT_SHORT.`,
          400,
          ErrorCode.VALIDATION_ERROR
        );
      }
    }

    const docType = await createDocumentType({
      name: data.name.trim(),
      description: data.description,
      isRequired: data.isRequired,
      requireIssueDate: data.requireIssueDate,
      requireExpiryDate: data.requireExpiryDate,
      appliesTo: data.appliesTo,
      isActive: data.isActive,
      sortOrder: data.sortOrder,
    });

    return successResponse(docType, "Document type created successfully", 201);
  },
  { roles: [UserRole.ADMIN] }
);
