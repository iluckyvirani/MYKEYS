import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/lib/response";
import { requireAuth } from "@/lib/auth/middleware";
import { createApiError, ErrorCode } from "@/lib/auth/errors";

/**
 * GET /api/documents/:id
 * Get a specific document
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authUser = await requireAuth(request);
    const { id } = params;

    const document = await prisma.document.findUnique({
      where: { id },
      select: {
        id: true,
        documentType: true,
        documentUrl: true,
        fileName: true,
        fileSize: true,
        mimeType: true,
        status: true,
        verifiedNotes: true,
        verifiedAt: true,
        expiresAt: true,
        userId: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!document) {
      return errorResponse(
        "Document not found",
        404,
        ErrorCode.RESOURCE_NOT_FOUND
      );
    }

    // Verify ownership
    if (document.userId !== authUser.userId) {
      return errorResponse(
        "Unauthorized",
        403,
        ErrorCode.FORBIDDEN
      );
    }

    return successResponse(document, "Document retrieved successfully", 200);
  } catch (error: any) {
    console.error("Error fetching document:", error);
    return errorResponse(
      error.message || "Failed to fetch document",
      500,
      ErrorCode.INTERNAL_SERVER_ERROR
    );
  }
}

/**
 * DELETE /api/documents/:id
 * Delete a document
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authUser = await requireAuth(request);
    const { id } = params;

    // Verify document exists and belongs to user
    const document = await prisma.document.findUnique({
      where: { id },
      select: { id: true, userId: true },
    });

    if (!document) {
      return errorResponse(
        "Document not found",
        404,
        ErrorCode.RESOURCE_NOT_FOUND
      );
    }

    if (document.userId !== authUser.userId) {
      return errorResponse(
        "Unauthorized",
        403,
        ErrorCode.FORBIDDEN
      );
    }

    // Delete document
    await prisma.document.delete({
      where: { id },
    });

    return successResponse(
      { id },
      "Document deleted successfully",
      200
    );
  } catch (error: any) {
    console.error("Error deleting document:", error);
    return errorResponse(
      error.message || "Failed to delete document",
      500,
      ErrorCode.INTERNAL_SERVER_ERROR
    );
  }
}

/**
 * PATCH /api/documents/:id
 * Update document expiration or re-upload
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authUser = await requireAuth(request);
    const { id } = params;

    // Verify document exists and belongs to user
    const document = await prisma.document.findUnique({
      where: { id },
      select: { id: true, userId: true },
    });

    if (!document) {
      return errorResponse(
        "Document not found",
        404,
        ErrorCode.RESOURCE_NOT_FOUND
      );
    }

    if (document.userId !== authUser.userId) {
      return errorResponse(
        "Unauthorized",
        403,
        ErrorCode.FORBIDDEN
      );
    }

    const body = await request.json();
    const { expiresAt } = body;

    const updateData: any = {};

    if (expiresAt !== undefined) {
      updateData.expiresAt = expiresAt ? new Date(expiresAt) : null;
    }

    const updatedDocument = await prisma.document.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        documentType: true,
        documentUrl: true,
        fileName: true,
        fileSize: true,
        mimeType: true,
        status: true,
        verifiedNotes: true,
        verifiedAt: true,
        expiresAt: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return successResponse(
      updatedDocument,
      "Document updated successfully",
      200
    );
  } catch (error: any) {
    console.error("Error updating document:", error);
    return errorResponse(
      error.message || "Failed to update document",
      500,
      ErrorCode.INTERNAL_SERVER_ERROR
    );
  }
}
