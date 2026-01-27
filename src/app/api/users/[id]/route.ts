import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/lib/response";
import { withAuth } from "@/lib/auth/middleware";
import { ErrorCode } from "@/lib/auth/errors";
import { JWTPayload } from "@/lib/auth/jwt";
import { toUserDTO } from "@/lib/auth/helpers";

/**
 * GET /api/users/[id]
 * Get user by ID (Admin only or own profile)
 */
export const GET = withAuth<{ params: { id: string } }>(
  async (request: NextRequest, user: JWTPayload, context) => {
    const { params } = context!;
    try {
      // Check if user is accessing their own profile or is admin
      if (user.role !== "ADMIN" && user.userId !== params.id) {
        return errorResponse(
          "You don't have permission to view this user",
          403,
          ErrorCode.FORBIDDEN
        );
      }

      const targetUser = await prisma.user.findUnique({
        where: { id: params.id },
        include: {
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
          properties: user.role === "ADMIN" || user.userId === params.id ? {
            select: {
              id: true,
              title: true,
              status: true,
              price: true,
              city: true,
              createdAt: true,
            },
            take: 5,
          } : false,
        },
      });

      if (!targetUser) {
        return errorResponse("User not found", 404, ErrorCode.USER_NOT_FOUND);
      }

      // Convert to DTO (exclude password)
      const userDTO = {
        ...toUserDTO(targetUser),
        counts: targetUser._count,
        recentProperties: targetUser.properties,
      };

      return successResponse(userDTO, "User retrieved successfully");
    } catch (error) {
      console.error("Get user error:", error);
      return errorResponse(
        "Failed to retrieve user",
        500,
        ErrorCode.INTERNAL_SERVER_ERROR
      );
    }
  }
);

/**
 * PATCH /api/users/[id]
 * Update user (Admin only)
 */
export const PATCH = withAuth<{ params: { id: string } }>(
  async (request: NextRequest, user: JWTPayload, context) => {
    const { params } = context!;
    try {
      const body = await request.json();

      // Check if user exists
      const existingUser = await prisma.user.findUnique({
        where: { id: params.id },
      });

      if (!existingUser) {
        return errorResponse("User not found", 404, ErrorCode.USER_NOT_FOUND);
      }

      // Update user
      const updatedUser = await prisma.user.update({
        where: { id: params.id },
        data: {
          ...(body.firstName && { firstName: body.firstName }),
          ...(body.lastName && { lastName: body.lastName }),
          ...(body.phone !== undefined && { phone: body.phone }),
          ...(body.avatar !== undefined && { avatar: body.avatar }),
          ...(body.role && { role: body.role }),
          ...(body.status && { status: body.status }),
          ...(body.companyName !== undefined && { companyName: body.companyName }),
          ...(body.taxId !== undefined && { taxId: body.taxId }),
          ...(body.bio !== undefined && { bio: body.bio }),
          ...(body.website !== undefined && { website: body.website }),
        },
      });

      const userDTO = toUserDTO(updatedUser);

      return successResponse(userDTO, "User updated successfully");
    } catch (error) {
      console.error("Update user error:", error);
      return errorResponse(
        "Failed to update user",
        500,
        ErrorCode.INTERNAL_SERVER_ERROR
      );
    }
  },
  { roles: ["ADMIN" as any] }
);

/**
 * DELETE /api/users/[id]
 * Delete user (Admin only)
 */
export const DELETE = withAuth<{ params: { id: string } }>(
  async (request: NextRequest, user: JWTPayload, context) => {
    const { params } = context!;
    try {
      // Check if user exists
      const existingUser = await prisma.user.findUnique({
        where: { id: params.id },
      });

      if (!existingUser) {
        return errorResponse("User not found", 404, ErrorCode.USER_NOT_FOUND);
      }

      // Prevent deleting self
      if (user.userId === params.id) {
        return errorResponse(
          "You cannot delete your own account",
          400,
          ErrorCode.INVALID_INPUT
        );
      }

      // Delete user (cascade will handle related records)
      await prisma.user.delete({
        where: { id: params.id },
      });

      return successResponse(null, "User deleted successfully");
    } catch (error) {
      console.error("Delete user error:", error);
      return errorResponse(
        "Failed to delete user",
        500,
        ErrorCode.INTERNAL_SERVER_ERROR
      );
    }
  },
  { roles: ["ADMIN" as any] }
);
