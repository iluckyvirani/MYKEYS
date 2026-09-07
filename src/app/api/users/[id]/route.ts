import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/lib/response";
import { withAuth } from "@/lib/auth/middleware";
import { ErrorCode } from "@/lib/auth/errors";
import { JWTPayload } from "@/lib/auth/jwt";
import { toUserDTO } from "@/lib/auth/helpers";
import { deleteUserAccount } from "@/lib/users/deleteUserAccount";

/**
 * GET /api/users/[id]
 * Get user by ID (Admin only or own profile)
 */
export const GET = withAuth<{ id: string }>(
  async (request: NextRequest, user: JWTPayload, context) => {
    const { id } = await context!.params;
    try {
      // Check if user is accessing their own profile or is admin
      if (user.role !== "ADMIN" && user.userId !== id) {
        return errorResponse(
          "You don't have permission to view this user",
          403,
          ErrorCode.FORBIDDEN
        );
      }

      const targetUser = await prisma.user.findUnique({
        where: { id },
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
          properties: user.role === "ADMIN" || user.userId === id ? {
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
      const userDTOData = await toUserDTO(targetUser);
      const userDTO = {
        ...userDTOData,
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
 * Update user (Admin only or self)
 */
export const PATCH = withAuth<{ id: string }>(
  async (request: NextRequest, user: JWTPayload, context) => {
    const { id } = await context!.params;
    try {
      const body = await request.json();

      // Check permissions
      if (user.role !== "ADMIN" && user.userId !== id) {
        return errorResponse(
          "You don't have permission to update this user",
          403,
          ErrorCode.FORBIDDEN
        );
      }

      // Check if user exists
      const existingUser = await prisma.user.findUnique({
        where: { id },
      });

      if (!existingUser) {
        return errorResponse("User not found", 404, ErrorCode.USER_NOT_FOUND);
      }

      // Check if phone is being changed and already exists
      if (body.phone && body.phone !== existingUser.phone) {
        const existingUserWithPhone = await prisma.user.findFirst({
          where: {
            phone: body.phone,
            NOT: { id },
          },
        });

        if (existingUserWithPhone) {
          return errorResponse(
            "Phone number already in use",
            400,
            ErrorCode.PHONE_ALREADY_EXISTS
          );
        }
      }

      // Update user
      const updatedUser = await prisma.user.update({
        where: { id },
        data: {
          ...(body.firstName && { firstName: body.firstName }),
          ...(body.lastName && { lastName: body.lastName }),
          ...(body.phone !== undefined && { phone: body.phone || null }),
          ...(body.avatar !== undefined && { avatar: body.avatar || null }),
          // Personal Information
          ...(body.birthDate !== undefined && {
            birthDate: body.birthDate || null,
          }),
          ...(body.gender !== undefined && {
            gender: body.gender || null,
          }),
          // Address Information
          ...(body.address !== undefined && { address: body.address || null }),
          ...(body.city !== undefined && { city: body.city || null }),
          ...(body.state !== undefined && { state: body.state || null }),
          ...(body.country !== undefined && { country: body.country || null }),
          ...(body.zipCode !== undefined && { zipCode: body.zipCode || null }),
          // Emergency Contact
          ...(body.emergencyName !== undefined && {
            emergencyName: body.emergencyName || null,
          }),
          ...(body.emergencyContact !== undefined && {
            emergencyContact: body.emergencyContact || null,
          }),
          // Owner-specific fields
          ...(body.website !== undefined && { website: body.website || null }),
          ...(body.companyName !== undefined && {
            companyName: body.companyName || null,
          }),
          ...(body.taxId !== undefined && { taxId: body.taxId || null }),
          // Admin only updates
          ...(user.role === "ADMIN" &&
            body.status && { status: body.status }),
          ...(user.role === "ADMIN" && body.role && { role: body.role }),
        },
      });

      // Convert to DTO (exclude password)
      const userDTO = await toUserDTO(updatedUser);

      return successResponse(userDTO, "User updated successfully");
    } catch (error) {
      console.error("Update user error:", error);

      if (error instanceof Error && "statusCode" in error) {
        const apiError = error as any;
        return errorResponse(
          apiError.message,
          apiError.statusCode,
          apiError.code,
          apiError.errors
        );
      }

      return errorResponse(
        "Failed to update user",
        500,
        ErrorCode.INTERNAL_SERVER_ERROR
      );
    }
  }
);

/**
 * DELETE /api/users/[id]
 * Delete user (Admin only)
 */
export const DELETE = withAuth<{ id: string }>(
  async (request: NextRequest, user: JWTPayload, context) => {
    const { id } = await context!.params;
    try {
      // Check if user is admin
      if (user.role !== "ADMIN") {
        return errorResponse(
          "You don't have permission to delete users",
          403,
          ErrorCode.FORBIDDEN
        );
      }

      // Check if user exists
      const existingUser = await prisma.user.findUnique({
        where: { id },
        include: {
          roles: true,
        },
      });

      if (!existingUser) {
        return errorResponse("User not found", 404, ErrorCode.USER_NOT_FOUND);
      }

      // Cannot delete admin
      if (existingUser.roles.some((r) => r.role === "ADMIN")) {
        return errorResponse(
          "Cannot delete admin users",
          400,
          ErrorCode.VALIDATION_ERROR
        );
      }

      // Delete user and related data
      await deleteUserAccount(id);

      return successResponse(null, "User deleted successfully");
    } catch (error) {
      console.error("Delete user error:", error);

      if (error instanceof Error && error.message.includes("Record to delete does not exist")) {
        return errorResponse("User not found", 404, ErrorCode.USER_NOT_FOUND);
      }

      return errorResponse(
        error instanceof Error ? error.message : "Failed to delete user",
        500,
        ErrorCode.INTERNAL_SERVER_ERROR
      );
    }
  }
);
