import { NextRequest } from 'next/server';
import { withAuth } from '@/lib/auth/middleware';
import { JWTPayload } from '@/lib/auth/jwt';
import { successResponse, errorResponse, paginatedResponse } from '@/lib/response';
import { serviceService } from '@/lib/services/serviceService';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/service/dashboard/stats
 * Get dashboard stats for the authenticated service provider
 */
export const GET = withAuth(async (request: NextRequest, user: JWTPayload) => {
  try {
    // Get the provider profile
    const provider = await prisma.serviceProvider.findUnique({
      where: { userId: user.userId },
    });

    if (!provider) {
      return errorResponse('Service provider profile not found', 404);
    }

    const stats = await serviceService.getDashboardStats(provider.id);

    return successResponse(stats, 'Dashboard stats retrieved successfully');
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    return errorResponse('Failed to get dashboard stats', 500);
  }
});
