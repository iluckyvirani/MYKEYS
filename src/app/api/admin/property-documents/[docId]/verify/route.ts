import { NextRequest } from "next/server";
import { withAuth, UserRole } from "@/lib/auth/middleware";
import { verifyPropertyDocument } from "@/lib/documents/documentService";
import { successResponse, errorResponse } from "@/lib/response";
import { ErrorCode } from "@/lib/auth/errors";
import { prisma } from "@/lib/prisma";

/**
 * PATCH /api/admin/property-documents/[docId]/verify
 * Admin verifies or rejects a property document
 */
export const PATCH = withAuth<{ docId: string }>(
  async (req, user, ctx) => {
    const data = await req.json();
    const { status, verifiedNotes } = data;

    if (!status || !["VERIFIED", "REJECTED"].includes(status)) {
      return errorResponse(
        'status must be "VERIFIED" or "REJECTED"',
        400,
        ErrorCode.VALIDATION_ERROR
      );
    }

    const docId = ctx!.params.docId;

    // Check document exists
    const doc = await prisma.propertyDocument.findUnique({
      where: { id: docId },
    });
    if (!doc) {
      return errorResponse(
        "Document not found",
        404,
        ErrorCode.RESOURCE_NOT_FOUND
      );
    }

    const updated = await verifyPropertyDocument(docId, {
      status,
      verifiedNotes,
      verifiedBy: user!.userId,
    });

    return successResponse(updated, `Document ${status.toLowerCase()} successfully`);
  },
  { roles: [UserRole.ADMIN] }
);
