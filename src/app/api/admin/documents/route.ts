import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse, paginatedResponse } from "@/lib/response";
import { withAuth } from "@/lib/auth/middleware";
import { ErrorCode } from "@/lib/auth/errors";
import { JWTPayload } from "@/lib/auth/jwt";

/**
 * GET /api/admin/documents
 * Get all documents for admin review with pagination and filters
 */
export const GET = withAuth(
  async (request: NextRequest, _user: JWTPayload) => {
    try {
      const { searchParams } = new URL(request.url);

      // Pagination
      const page = parseInt(searchParams.get("page") || "1");
      const pageSize = parseInt(searchParams.get("pageSize") || "20");
      const skip = (page - 1) * pageSize;

      // Filters
      const search = searchParams.get("search");
      const status = searchParams.get("status");
      const documentType = searchParams.get("documentType");
      const userType = searchParams.get("userType");

      // Build where clause
      const where: any = {};

      if (search) {
        where.OR = [
          { fileName: { contains: search, mode: "insensitive" } },
          { user: { name: { contains: search, mode: "insensitive" } } },
          { user: { email: { contains: search, mode: "insensitive" } } },
        ];
      }

      if (status) {
        where.status = status;
      }

      if (documentType) {
        where.documentType = documentType;
      }

      // Filter by user type/role if needed
      if (userType) {
        where.user = {
          ...where.user,
          roles: {
            some: {
              role: userType.toUpperCase(),
            },
          },
        };
      }

      // Get documents with pagination
      const [documents, total] = await Promise.all([
        prisma.document.findMany({
          where,
          skip,
          take: pageSize,
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                roles: {
                  select: {
                    role: true,
                  },
                },
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
        }),
        prisma.document.count({ where }),
      ]);

      // Format documents
      const formattedDocuments = documents.map((doc: any) => ({
        id: doc.id,
        documentType: doc.documentType,
        documentUrl: doc.documentUrl,
        fileName: doc.fileName,
        fileSize: doc.fileSize,
        mimeType: doc.mimeType,
        status: doc.status,
        verifiedNotes: doc.verifiedNotes,
        verifiedBy: doc.verifiedBy,
        verifiedAt: doc.verifiedAt,
        expiresAt: doc.expiresAt,
        createdAt: doc.createdAt,
        updatedAt: doc.updatedAt,
        userId: doc.userId,
        userName: doc.user?.name || "Unknown",
        userEmail: doc.user?.email || "",
        userType: doc.user?.roles?.[0]?.role || "USER",
      }));

      return paginatedResponse(
        formattedDocuments,
        total,
        page,
        pageSize,
        "Documents retrieved successfully"
      );
    } catch (error) {
      console.error("Admin get documents error:", error);
      return errorResponse(
        "Failed to retrieve documents",
        500,
        ErrorCode.INTERNAL_SERVER_ERROR
      );
    }
  },
  { roles: ["ADMIN" as any] }
);
