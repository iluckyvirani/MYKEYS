import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/lib/response";
import { requireAuth } from "@/lib/auth/middleware";
import { updateProfileSchema, validateSchema } from "@/lib/auth/validation";
import { toUserDTO } from "@/lib/auth/helpers";
import { createApiError, ErrorCode } from "@/lib/auth/errors";
import { UpdateProfileRequest } from "@/types/auth";

/**
 * PATCH /api/auth/profile
 * Update authenticated user's profile
 */
export async function PATCH(request: NextRequest) {
  try {
    // Verify authentication
    const authUser = await requireAuth(request);

    // Parse request body
    const body: UpdateProfileRequest = await request.json();

    // Validate input
    const validation = validateSchema(updateProfileSchema, body);
    if (!validation.success) {
      return errorResponse(
        "Validation failed",
        400,
        ErrorCode.VALIDATION_ERROR,
        validation.errors
      );
    }

    const validatedData = validation.data;

    // Check if phone is being changed and already exists
    if (validatedData.phone) {
      const existingUserWithPhone = await prisma.user.findFirst({
        where: {
          phone: validatedData.phone,
          NOT: { id: authUser.userId },
        },
      });

      if (existingUserWithPhone) {
        throw createApiError(ErrorCode.PHONE_ALREADY_EXISTS);
      }
    }

    // Update user profile
    const updatedUser = await prisma.user.update({
      where: { id: authUser.userId },
      data: {
        ...(validatedData.firstName && { firstName: validatedData.firstName }),
        ...(validatedData.lastName && { lastName: validatedData.lastName }),
        ...(validatedData.phone !== undefined && {
          phone: validatedData.phone || null,
        }),
        ...(validatedData.avatar !== undefined && {
          avatar: validatedData.avatar || null,
        }),
        // Personal Information
        ...(validatedData.birthDate !== undefined && {
          birthDate: validatedData.birthDate || null,
        }),
        ...(validatedData.gender !== undefined && {
          gender: validatedData.gender || null,
        }),
        // Address Information
        ...(validatedData.address !== undefined && {
          address: validatedData.address || null,
        }),
        ...(validatedData.city !== undefined && {
          city: validatedData.city || null,
        }),
        ...(validatedData.state !== undefined && {
          state: validatedData.state || null,
        }),
        ...(validatedData.country !== undefined && {
          country: validatedData.country || null,
        }),
        ...(validatedData.zipCode !== undefined && {
          zipCode: validatedData.zipCode || null,
        }),
        // Emergency Contact
        ...(validatedData.emergencyName !== undefined && {
          emergencyName: validatedData.emergencyName || null,
        }),
        ...(validatedData.emergencyContact !== undefined && {
          emergencyContact: validatedData.emergencyContact || null,
        }),
        // Owner-specific fields
        ...(validatedData.website !== undefined && {
          website: validatedData.website || null,
        }),
        ...(validatedData.companyName !== undefined && {
          companyName: validatedData.companyName || null,
        }),
        ...(validatedData.taxId !== undefined && {
          taxId: validatedData.taxId || null,
        }),
        ...(validatedData.agentLogo !== undefined && {
          agentLogo: validatedData.agentLogo || null,
        }),
      },
    });

    // Convert to DTO (exclude password)
    const userDTO = await toUserDTO(updatedUser);

    return successResponse(userDTO, "Profile updated successfully");
  } catch (error) {
    console.error("Update profile error:", error);

    if (error instanceof Error && "statusCode" in error) {
      const apiError = error as any;
      return errorResponse(
        apiError.message,
        apiError.statusCode,
        apiError.code,
        apiError.errors
      );
    }

    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return errorResponse("Unauthorized. Please login.", 401);
    }

    return errorResponse(
      "Failed to update profile.",
      500,
      ErrorCode.INTERNAL_SERVER_ERROR
    );
  }
}
