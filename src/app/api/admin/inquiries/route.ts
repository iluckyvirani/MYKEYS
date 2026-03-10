import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse, paginatedResponse } from "@/lib/response";
import { withAuth } from "@/lib/auth/middleware";
import { ErrorCode } from "@/lib/auth/errors";
import { JWTPayload } from "@/lib/auth/jwt";

/**
 * GET /api/admin/inquiries
 * Get all inquiries for admin dashboard with filters and pagination
 * Roles: ADMIN only
 * Query params: page, pageSize, status, propertyId, from, to, search, sortBy, sortOrder
 */
export const GET = withAuth(
  async (request: NextRequest, user: JWTPayload) => {
    try {
      const { searchParams } = new URL(request.url);

      // Pagination
      const page = parseInt(searchParams.get("page") || "1");
      const pageSize = parseInt(searchParams.get("pageSize") || "10");
      const skip = (page - 1) * pageSize;

      // Sorting
      const sortBy = searchParams.get("sortBy") || "createdAt";
      const sortOrder = (searchParams.get("sortOrder") || "desc") as "asc" | "desc";

      // Filters
      const status = searchParams.get("status");
      const propertyId = searchParams.get("propertyId");
      const from = searchParams.get("from");
      const to = searchParams.get("to");
      const search = searchParams.get("search");

      // Build where clause
      const where: any = {};

      if (status && status !== "ALL") where.status = status;
      if (propertyId) where.propertyId = propertyId;

      if (from || to) {
        where.createdAt = {};
        if (from) where.createdAt.gte = new Date(from);
        if (to) where.createdAt.lte = new Date(to);
      }

      if (search) {
        where.OR = [
          { email: { contains: search, mode: "insensitive" } },
          { phone: { contains: search, mode: "insensitive" } },
          { message: { contains: search, mode: "insensitive" } },
          { property: { title: { contains: search, mode: "insensitive" } } },
          {
            user: {
              OR: [
                { firstName: { contains: search, mode: "insensitive" } },
                { lastName: { contains: search, mode: "insensitive" } },
              ],
            },
          },
        ];
      }

      // Build orderBy clause
      const orderBy: any = {};
      if (sortBy === "status") {
        orderBy.status = sortOrder;
      } else if (sortBy === "email") {
        orderBy.email = sortOrder;
      } else {
        orderBy.createdAt = sortOrder;
      }

      // Get inquiries with pagination
      const [inquiries, total] = await Promise.all([
        prisma.inquiry.findMany({
          where,
          skip,
          take: pageSize,
          orderBy,
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
            property: {
              select: {
                id: true,
                title: true,
                city: true,
                ownerId: true,
                owner: {
                  select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    email: true,
                  },
                },
              },
            },
          },
        }),
        prisma.inquiry.count({ where }),
      ]);

      // Transform data to DTO format
      const inquiryDTOs = inquiries.map((i: any) => ({
        id: i.id,
        userId: i.userId,
        userName: i.user
          ? `${i.user.firstName} ${i.user.lastName}`
          : i.firstName,
        userEmail: i.user?.email || i.email,
        phone: i.phone,
        propertyId: i.propertyId,
        propertyTitle: i.property?.title || "N/A",
        propertyOwner: i.property?.ownerId,
        ownerName: i.property?.owner
          ? `${i.property.owner.firstName} ${i.property.owner.lastName}`
          : "Unknown Owner",
        ownerEmail: i.property?.owner?.email || "",
        message: i.message,
        status: i.status,
        inquiryType: i.inquiryType || "general",
        priority: i.priority || "medium",
        budget: i.budget,
        duration: i.duration,
        ownerResponse: i.response,
        ownerResponseAt: i.respondedAt,
        createdAt: i.createdAt,
        updatedAt: i.updatedAt,
      }));

      return paginatedResponse(
        inquiryDTOs,
        total,
        page,
        pageSize,
        "Inquiries retrieved successfully"
      );
    } catch (error) {
      console.error("Get admin inquiries error:", error);
      return errorResponse(
        "Failed to retrieve inquiries",
        500,
        ErrorCode.INTERNAL_SERVER_ERROR
      );
    }
  },
  { roles: ["ADMIN" as any] }
);

/**
 * PATCH /api/admin/inquiries
 * Update inquiry status (mark as read, replied, closed, etc.)
 * Body: { inquiryId: string, status?: string, reply?: string, notes?: string }
 * Roles: ADMIN only
 */
export const PATCH = withAuth(
  async (request: NextRequest, user: JWTPayload) => {
    try {
      const { inquiryId, status, reply, notes } = await request.json();

      if (!inquiryId) {
        return errorResponse("inquiryId is required", 400);
      }

      const updateData: any = {};
      if (status) updateData.status = status;
      if (reply) updateData.reply = reply;
      if (notes) updateData.adminNotes = notes;

      if (Object.keys(updateData).length === 0) {
        return errorResponse("At least one field to update is required", 400);
      }

      const validStatuses = ["NEW", "READ", "REPLIED", "CLOSED", "CONVERTED"];
      if (status && !validStatuses.includes(status)) {
        return errorResponse(
          `Invalid status. Must be one of: ${validStatuses.join(", ")}`,
          400
        );
      }

      const updatedInquiry = await prisma.inquiry.update({
        where: { id: inquiryId },
        data: updateData,
        include: {
          user: { select: { firstName: true, lastName: true, email: true } },
          property: { select: { title: true } },
        },
      });

      return successResponse(updatedInquiry, "Inquiry updated successfully");
    } catch (error: any) {
      console.error("Update inquiry error:", error);
      if (error.code === "P2025") {
        return errorResponse("Inquiry not found", 404);
      }
      return errorResponse(
        error.message || "Failed to update inquiry",
        500,
        ErrorCode.INTERNAL_SERVER_ERROR
      );
    }
  },
  { roles: ["ADMIN" as any] }
);
