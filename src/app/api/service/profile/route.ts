import { NextRequest } from 'next/server';
import { withAuth } from '@/lib/auth/middleware';
import { JWTPayload } from '@/lib/auth/jwt';
import { successResponse, errorResponse } from '@/lib/response';
import { serviceService } from '@/lib/services/serviceService';

/**
 * GET /api/service/profile
 * Get service provider profile
 */
export const GET = withAuth(async (request: NextRequest, user: JWTPayload) => {
  try {
    const profile = await serviceService.getProfile(user.userId);
    return successResponse(profile, 'Profile retrieved successfully');
  } catch (error) {
    console.error('Get service profile error:', error);
    const message = error instanceof Error ? error.message : 'Failed to get profile';
    return errorResponse(message, 404);
  }
});

/**
 * PUT /api/service/profile
 * Update service provider profile
 */
export const PUT = withAuth(async (request: NextRequest, user: JWTPayload) => {
  try {
    const body = await request.json();

    const updatedProfile = await serviceService.updateProfile(user.userId, {
      name: body.name,
      email: body.email,
      phone: body.phone,
      city: body.city,
      state: body.state,
      bio: body.bio,
      specializations: body.specializations,
      certifications: body.certifications,
    });

    return successResponse(updatedProfile, 'Profile updated successfully');
  } catch (error) {
    console.error('Update service profile error:', error);
    const message = error instanceof Error ? error.message : 'Failed to update profile';
    return errorResponse(message, 400);
  }
});
