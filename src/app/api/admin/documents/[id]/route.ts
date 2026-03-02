import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/lib/response";
import { withAuth } from "@/lib/auth/middleware";
import { ErrorCode } from "@/lib/auth/errors";
import { JWTPayload } from "@/lib/auth/jwt";

/**
 * GET /api/admin/documents/:id
 * Get a specific document details for admin
 */
export const GET = withAuth<{ params: Promise<{ id: string }> }>(
  async (request: NextRequest, _user: JWTPayload, context) => {
    const { id } = await context!.params;
    try {
      const document = await prisma.document.findUnique({
        where: { id },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
              roles: {
                select: {
                  role: true,
                },
              },
            },
          },
        },
      });

      if (!document) {
        return errorResponse(
          "Document not found",
          404,
          ErrorCode.RESOURCE_NOT_FOUND
        );
      }

      return successResponse(
        {
          ...document,
          userName: document.user?.name || "Unknown",
          userEmail: document.user?.email || "",
          userPhone: document.user?.phone || "",
          userType: document.user?.roles?.[0]?.role || "USER",
        },
        "Document retrieved successfully"
      );
    } catch (error) {
      console.error("Admin get document error:", error);
      return errorResponse(
        "Failed to retrieve document",
        500,
        ErrorCode.INTERNAL_SERVER_ERROR
      );
    }
  },
  { roles: ["ADMIN" as any] }
);

/**
 * PATCH /api/admin/documents/:id
 * Admin approve or reject a document
 */
export const PATCH = withAuth<{ params: Promise<{ id: string }> }>(
  async (request: NextRequest, user: JWTPayload, context) => {
    const { id } = await context!.params;
    try {
      const body = await request.json();
      const { status, verifiedNotes } = body;

      // Validate status
      if (status && !["PENDING", "VERIFIED", "REJECTED"].includes(status)) {
        return errorResponse(
          "Invalid status. Must be PENDING, VERIFIED, or REJECTED",
          400,
          ErrorCode.VALIDATION_ERROR
        );
      }

      // Check if document exists with user and roles
      const document = await prisma.document.findUnique({
        where: { id },
        include: {
          user: {
            include: {
              roles: true,
              serviceProvider: true,
            },
          },
        },
      });

      if (!document) {
        return errorResponse(
          "Document not found",
          404,
          ErrorCode.RESOURCE_NOT_FOUND
        );
      }

      // Update document
      const updateData: any = {};
      
      if (status) {
        updateData.status = status;
        updateData.verifiedBy = user.userId;
        updateData.verifiedAt = new Date();
      }

      if (verifiedNotes !== undefined) {
        updateData.verifiedNotes = verifiedNotes;
      }

      const updatedDocument = await prisma.document.update({
        where: { id },
        data: updateData,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      // If this is a service provider document verification, update ServiceProvider.documentVerified
      const isServiceUser = document.user?.roles?.some((r: any) => r.role === "SERVICE");
      const isServiceDocument = [
        "SERVICE_CERTIFICATE",
        "SERVICE_LICENSE", 
        "SERVICE_SKILL_CERTIFICATE",
        "SERVICE_EXPERIENCE_LETTER",
        "SERVICE_TRAINING_CERTIFICATE",
      ].includes(document.documentType);

      if (isServiceUser && isServiceDocument && status === "VERIFIED" && document.user?.serviceProvider) {
        // Check if at least one service document is verified
        const verifiedServiceDocs = await prisma.document.count({
          where: {
            userId: document.userId,
            status: "VERIFIED",
            documentType: {
              in: [
                "SERVICE_CERTIFICATE",
                "SERVICE_LICENSE",
                "SERVICE_SKILL_CERTIFICATE",
                "SERVICE_EXPERIENCE_LETTER",
                "SERVICE_TRAINING_CERTIFICATE",
              ] as any,
            },
          },
        });

        // Update ServiceProvider.documentVerified if any service document is verified
        if (verifiedServiceDocs > 0) {
          await prisma.serviceProvider.update({
            where: { userId: document.userId },
            data: { documentVerified: true },
          });
        }
      }

      // If document is rejected, check if we need to revoke verification
      if (isServiceUser && isServiceDocument && status === "REJECTED" && document.user?.serviceProvider) {
        const verifiedServiceDocs = await prisma.document.count({
          where: {
            userId: document.userId,
            status: "VERIFIED",
            documentType: {
              in: [
                "SERVICE_CERTIFICATE",
                "SERVICE_LICENSE",
                "SERVICE_SKILL_CERTIFICATE",
                "SERVICE_EXPERIENCE_LETTER",
                "SERVICE_TRAINING_CERTIFICATE",
              ] as any,
            },
          },
        });

        // If no verified service documents, revoke verification
        if (verifiedServiceDocs === 0) {
          await prisma.serviceProvider.update({
            where: { userId: document.userId },
            data: { documentVerified: false },
          });
        }
      }

      return successResponse(
        {
          ...updatedDocument,
          userName: updatedDocument.user?.name || "Unknown",
          userEmail: updatedDocument.user?.email || "",
        },
        `Document ${status === "VERIFIED" ? "approved" : status === "REJECTED" ? "rejected" : "updated"} successfully`
      );
    } catch (error) {
      console.error("Admin update document error:", error);
      return errorResponse(
        "Failed to update document",
        500,
        ErrorCode.INTERNAL_SERVER_ERROR
      );
    }
  },
  { roles: ["ADMIN" as any] }
);
