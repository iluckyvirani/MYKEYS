import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse, paginatedResponse } from "@/lib/response";
import { withAuth } from "@/lib/auth/middleware";
import { ErrorCode } from "@/lib/auth/errors";
import { JWTPayload } from "@/lib/auth/jwt";
import { toUserDTO } from "@/lib/auth/helpers";

/**
 * GET /api/users
 * Get all users (Admin only)
 */
export const GET = withAuth(
  async (request: NextRequest, user: JWTPayload) => {
    try {
      const { searchParams } = new URL(request.url);

      // Pagination
      const page = parseInt(searchParams.get("page") || "1");
      const pageSize = parseInt(searchParams.get("pageSize") || "10");
      const skip = (page - 1) * pageSize;

      // Filters
      const role = searchParams.get("role");
      const status = searchParams.get("status");
      const search = searchParams.get("search");

      // Build where clause
      const where: any = {};

      if (role) where.role = role;
      if (status) where.status = status;
      if (search) {
        where.OR = [
          { email: { contains: search, mode: "insensitive" } },
          { firstName: { contains: search, mode: "insensitive" } },
          { lastName: { contains: search, mode: "insensitive" } },
          { phone: { contains: search, mode: "insensitive" } },
        ];
      }

      // Get users with pagination
      const [users, total] = await Promise.all([
        prisma.user.findMany({
          where,
          skip,
          take: pageSize,
          orderBy: {
            createdAt: "desc",
          },
          include: {
            _count: {
              select: {
                properties: true,
                bookingsAsGuest: true,
                inquiries: true,
                reviews: true,
              },
            },
          },
        }),
        prisma.user.count({ where }),
      ]);

      // Convert to DTOs (exclude passwords)
      const userDTOs = users.map((u: any) => ({
        ...toUserDTO(u),
        counts: u._count,
      }));

      return paginatedResponse(
        userDTOs,
        total,
        page,
        pageSize,
        "Users retrieved successfully"
      );
    } catch (error) {
      console.error("Get users error:", error);
      return errorResponse(
        "Failed to retrieve users",
        500,
        ErrorCode.INTERNAL_SERVER_ERROR
      );
    }
  },
  { roles: ["ADMIN" as any] }
);
