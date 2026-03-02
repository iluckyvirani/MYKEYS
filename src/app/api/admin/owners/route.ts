import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse, paginatedResponse } from "@/lib/response";
import { withAuth } from "@/lib/auth/middleware";
import { ErrorCode } from "@/lib/auth/errors";
import { JWTPayload } from "@/lib/auth/jwt";

/**
 * GET /api/admin/owners
 * Get all property owners for admin dashboard with filters and pagination
 * Roles: ADMIN only
 * Query params: page, pageSize, status, city, search, sortBy, sortOrder
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
      const city = searchParams.get("city");
      const search = searchParams.get("search");

      // Build where clause
      const where: any = {
        role: "OWNER",
      };

      if (status && status !== "ALL") where.status = status;

      if (search) {
        where.OR = [
          { email: { contains: search, mode: "insensitive" } },
          { firstName: { contains: search, mode: "insensitive" } },
          { lastName: { contains: search, mode: "insensitive" } },
          { phone: { contains: search, mode: "insensitive" } },
        ];
      }

      // Build orderBy clause
      const orderBy: any = {};
      if (sortBy === "name") {
        orderBy.firstName = sortOrder;
      } else if (sortBy === "email") {
        orderBy.email = sortOrder;
      } else if (sortBy === "properties") {
        orderBy.properties = { _count: sortOrder };
      } else {
        orderBy.createdAt = sortOrder;
      }

      // Get owners with pagination
      const [owners, total] = await Promise.all([
        prisma.user.findMany({
          where,
          skip,
          take: pageSize,
          orderBy,
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            status: true,
            createdAt: true,
            updatedAt: true,
            properties: {
              select: {
                id: true,
                title: true,
                status: true,
                price: true,
              },
            },
            _count: {
              select: {
                properties: true,
                bookingsAsOwner: true,
              },
            },
          },
        }),
        prisma.user.count({ where }),
      ]);

      // Transform data to DTO format
      const ownerDTOs = owners.map((o: any) => {
        const activeProperties = o.properties.filter(
          (p: any) => p.status === "ACTIVE"
        ).length;

        return {
          id: o.id,
          firstName: o.firstName,
          lastName: o.lastName,
          email: o.email,
          phone: o.phone,
          status: o.status,
          createdAt: o.createdAt,
          updatedAt: o.updatedAt,
          totalProperties: o._count.properties,
          activeProperties,
          totalBookings: o._count.bookingsAsOwner,
          properties: o.properties.slice(0, 5), // Show last 5 properties
        };
      });

      return paginatedResponse(
        ownerDTOs,
        total,
        page,
        pageSize,
        "Owners retrieved successfully"
      );
    } catch (error) {
      console.error("Get admin owners error:", error);
      return errorResponse(
        "Failed to retrieve owners",
        500,
        ErrorCode.INTERNAL_SERVER_ERROR
      );
    }
  },
  { roles: ["ADMIN" as any] }
);

/**
 * PATCH /api/admin/owners
 * Update owner status or details
 * Body: { userId: string, status?: string, notes?: string }
 * Roles: ADMIN only
 */
export const PATCH = withAuth(
  async (request: NextRequest, user: JWTPayload) => {
    try {
      const { userId, status, notes } = await request.json();

      if (!userId) {
        return errorResponse("userId is required", 400);
      }

      // Verify user is an owner
      const userCheck = await prisma.user.findUnique({
        where: { id: userId },
        include: { roles: true },
      });

      if (!userCheck || !userCheck.roles.some((r) => r.role === "OWNER")) {
        return errorResponse("User is not an owner", 400);
      }

      const updateData: any = {};
      if (status) updateData.status = status;
      if (notes) updateData.adminNotes = notes;

      if (Object.keys(updateData).length === 0) {
        return errorResponse("At least one field to update is required", 400);
      }

      const validStatuses = ["ACTIVE", "INACTIVE", "SUSPENDED", "PENDING"];
      if (status && !validStatuses.includes(status)) {
        return errorResponse(
          `Invalid status. Must be one of: ${validStatuses.join(", ")}`,
          400
        );
      }

      const updatedOwner = await prisma.user.update({
        where: { id: userId },
        data: updateData,
        include: {
          _count: {
            select: {
              properties: true,
              bookingsAsOwner: true,
            },
          },
        },
      });

      return successResponse(updatedOwner, "Owner updated successfully");
    } catch (error: any) {
      console.error("Update owner error:", error);
      if (error.code === "P2025") {
        return errorResponse("Owner not found", 404);
      }
      return errorResponse(
        error.message || "Failed to update owner",
        500,
        ErrorCode.INTERNAL_SERVER_ERROR
      );
    }
  },
  { roles: ["ADMIN" as any] }
);
