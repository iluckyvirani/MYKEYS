import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/lib/response";
import { requireAuth } from "@/lib/auth/middleware";
import { createApiError, ErrorCode } from "@/lib/auth/errors";

/**
 * GET /api/documents
 * Get all documents for the authenticated user
 */
export async function GET(request: NextRequest) {
  try {
    const authUser = await requireAuth(request);

    const documents = await prisma.document.findMany({
      where: { userId: authUser.userId },
      orderBy: { createdAt: "desc" },
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

    return successResponse(documents, "Documents retrieved successfully", 200);
  } catch (error: any) {
    console.error("Error fetching documents:", error);
    return errorResponse(
      error.message || "Failed to fetch documents",
      500,
      ErrorCode.INTERNAL_SERVER_ERROR
    );
  }
}

/**
 * POST /api/documents
 * Upload a new document
 */
export async function POST(request: NextRequest) {
  try {
    const authUser = await requireAuth(request);

    const body = await request.json();
    const { documentType, fileName, fileSize, mimeType, documentUrl, expiresAt } = body;

    // Validation
    if (!documentType) {
      return errorResponse(
        "Document type is required",
        400,
        ErrorCode.VALIDATION_ERROR
      );
    }

    if (!documentUrl) {
      return errorResponse(
        "Document URL is required",
        400,
        ErrorCode.VALIDATION_ERROR
      );
    }

    // Validate document type
    const validDocumentTypes = [
      // User documents
      "PAN_CARD",
      "AADHAR_CARD",
      "DRIVING_LICENSE",
      "PASSPORT",
      "VOTER_ID",
      // Owner documents
      "PROPERTY_LICENSE",
      "BUSINESS_LICENSE",
      "GST_CERTIFICATE",
      "TAX_IDENTIFICATION",
      "RENTAL_AGREEMENT_TEMPLATE",
      // Service provider documents
      "SERVICE_CERTIFICATE",
      "SERVICE_LICENSE",
      "SERVICE_SKILL_CERTIFICATE",
      "SERVICE_EXPERIENCE_LETTER",
      "SERVICE_TRAINING_CERTIFICATE",
    ];

    if (!validDocumentTypes.includes(documentType)) {
      return errorResponse(
        "Invalid document type",
        400,
        ErrorCode.VALIDATION_ERROR
      );
    }

    // Create document record in database
    const document = await prisma.document.create({
      data: {
        documentType: documentType as any,
        documentUrl,
        fileName: fileName || `${documentType.toLowerCase()}-${Date.now()}`,
        fileSize: fileSize || 0,
        mimeType: mimeType || "image/jpeg",
        userId: authUser.userId,
        status: "PENDING",
        expiresAt: expiresAt ? new Date(expiresAt) : null,
      },
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
      document,
      "Document uploaded successfully",
      201
    );
  } catch (error: any) {
    console.error("Error uploading document:", error);
    return errorResponse(
      error.message || "Failed to upload document",
      500,
      ErrorCode.INTERNAL_SERVER_ERROR
    );
  }
}
