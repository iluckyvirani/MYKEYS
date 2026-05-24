import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { RoleType } from '@prisma/client';
import { successResponse, errorResponse } from '@/lib/response';
import { verifyAccessToken, generateTokenPair } from '@/lib/auth/jwt';
import { toUserDTO } from '@/lib/auth/helpers';
import { ErrorCode, createApiError } from '@/lib/auth/errors';
import { serviceService } from '@/lib/services/serviceService';

/**
 * POST /api/users/become-service
 * Allow a USER to become a SERVICE provider by adding SERVICE role and creating provider profile
 */
export async function POST(request: NextRequest) {
  try {
    // Get token from authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw createApiError(ErrorCode.UNAUTHORIZED);
    }

    const token = authHeader.substring(7);
    const payload = await verifyAccessToken(token);

    if (!payload) {
      throw createApiError(ErrorCode.UNAUTHORIZED);
    }

    // Get the user
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      include: { roles: true },
    });

    if (!user) {
      throw createApiError(ErrorCode.USER_NOT_FOUND);
    }

    // Check if user already has SERVICE role
    const hasServiceRole = user.roles.some((r) => r.role === 'SERVICE');
    if (hasServiceRole) {
      return errorResponse('User already has SERVICE role', 400, ErrorCode.VALIDATION_ERROR);
    }

    // Parse request body for service provider details
    let body: any = {};
    try {
      body = await request.json();
    } catch {
      // If body is empty, use defaults
    }

    // Add SERVICE role
    await prisma.userRoleAssignment.create({
      data: {
        userId: user.id,
        role: RoleType.SERVICE,
      },
    });

    // Create service provider profile
    await serviceService.createProvider({
      userId: user.id,
      bio: body.bio,
      category: body.category || 'plumbing',
      categories: Array.isArray(body.categoryIds) && body.categoryIds.length > 0
        ? body.categoryIds
        : body.category ? [body.category] : [],
      subcategories: body.subcategories || [],
      serviceAreas: body.serviceAreas || [],
      specializations: body.specializations || [],
      certifications: body.certifications || [],
      instantBookingEnabled: body.instantBookingEnabled || false,
      instantBookingPrice: body.instantBookingPrice,
    });

    // Update user details if provided
    if (body.city || body.state || body.phone) {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          ...(body.city && { city: body.city }),
          ...(body.state && { state: body.state }),
          ...(body.phone && { phone: body.phone }),
        },
      });
    }

    // Fetch updated user
    const updatedUser = await prisma.user.findUnique({
      where: { id: user.id },
      include: { roles: true },
    });

    if (!updatedUser) {
      throw createApiError(ErrorCode.USER_NOT_FOUND);
    }

    const userDTO = await toUserDTO(updatedUser);

    // Generate new tokens with SERVICE role
    const { accessToken: newAccessToken, refreshToken: newRefreshToken } = await generateTokenPair(
      user.id,
      user.email,
      'SERVICE'
    );

    return successResponse(
      {
        user: userDTO,
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      },
      'You are now a service professional! You can start offering services.',
      200
    );
  } catch (error) {
    console.error('Become service error:', error);

    if (error instanceof Error && 'statusCode' in error) {
      const apiError = error as any;
      return errorResponse(
        apiError.message,
        apiError.statusCode,
        apiError.code
      );
    }

    const message = error instanceof Error ? error.message : 'Failed to become service provider';
    return errorResponse(message, 500);
  }
}
