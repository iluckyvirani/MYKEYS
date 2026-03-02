import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse, paginatedResponse } from "@/lib/response";
import { withAuth } from "@/lib/auth/middleware";
import { ErrorCode } from "@/lib/auth/errors";
import { JWTPayload } from "@/lib/auth/jwt";

/**
 * GET /api/admin/users
 * Get all users for admin dashboard with filters and pagination
 * Roles: ADMIN only
 * Query params: page, pageSize, role, status, search, sortBy, sortOrder
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
      const role = searchParams.get("role");
      const status = searchParams.get("status");
      const search = searchParams.get("search");

      // Build where clause
      const where: any = {};

      if (role && role !== "ALL") {
        where.roles = { some: { role: role } };
      }
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
      } else if (sortBy === "status") {
        orderBy.status = sortOrder;
      } else {
        orderBy.createdAt = sortOrder;
      }

      // Get users with pagination
      const [users, total] = await Promise.all([
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
            roles: { select: { role: true } },
            status: true,
            createdAt: true,
            updatedAt: true,
            _count: {
              select: {
                properties: true,
                bookingsAsGuest: true,
                bookingsAsOwner: true,
                inquiries: true,
                reviews: true,
                packages: true,
              },
            },
          },
        }),
        prisma.user.count({ where }),
      ]);

      // Transform data to DTO format
      const userDTOs = users.map((u: any) => ({
        id: u.id,
        firstName: u.firstName,
        lastName: u.lastName,
        email: u.email,
        phone: u.phone,
        roles: u.roles.map((r: any) => r.role),
        status: u.status,
        createdAt: u.createdAt,
        updatedAt: u.updatedAt,
        propertiesCount: u._count.properties,
        bookingsAsGuestCount: u._count.bookingsAsGuest,
        bookingsAsOwnerCount: u._count.bookingsAsOwner,
        inquiriesCount: u._count.inquiries,
        reviewsCount: u._count.reviews,
        packagesCount: u._count.packages,
        totalBookings: u._count.bookingsAsGuest + u._count.bookingsAsOwner,
      }));

      return paginatedResponse(
        userDTOs,
        total,
        page,
        pageSize,
        "Users retrieved successfully"
      );
    } catch (error) {
      console.error("Get admin users error:", error);
      return errorResponse(
        "Failed to retrieve users",
        500,
        ErrorCode.INTERNAL_SERVER_ERROR
      );
    }
  },
  { roles: ["ADMIN" as any] }
);

/**
 * PATCH /api/admin/users
 * Update user status (suspend, activate, etc.)
 * Body: { userId: string, status: string }
 * Roles: ADMIN only
 */
export const PATCH = withAuth(
  async (request: NextRequest, user: JWTPayload) => {
    try {
      const { userId, status } = await request.json();

      if (!userId) {
        return errorResponse("userId is required", 400);
      }

      if (!status) {
        return errorResponse("status is required", 400);
      }

      const validStatuses = ["ACTIVE", "INACTIVE", "SUSPENDED", "PENDING"];
      if (!validStatuses.includes(status)) {
        return errorResponse(
          `Invalid status. Must be one of: ${validStatuses.join(", ")}`,
          400
        );
      }

      // Cannot suspend yourself
      if (userId === user.userId && status === "SUSPENDED") {
        return errorResponse("You cannot suspend your own account", 400);
      }

      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: { status },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          status: true,
          updatedAt: true,
        },
      });

      return successResponse(
        updatedUser,
        `User status updated to ${status}`
      );
    } catch (error: any) {
      console.error("Update user error:", error);
      if (error.code === "P2025") {
        return errorResponse("User not found", 404);
      }
      return errorResponse(
        error.message || "Failed to update user",
        500,
        ErrorCode.INTERNAL_SERVER_ERROR
      );
    }
  },
  { roles: ["ADMIN" as any] }
);
