import { NextRequest } from 'next/server';
import { withAuth } from '@/lib/auth/middleware';
import { JWTPayload } from '@/lib/auth/jwt';
import { successResponse, errorResponse } from '@/lib/response';
import { serviceService } from '@/lib/services/serviceService';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/service/earnings
 * Get earnings data with charts and transactions
 */
export const GET = withAuth(async (request: NextRequest, user: JWTPayload) => {
  try {
    const provider = await prisma.serviceProvider.findUnique({
      where: { userId: user.userId },
    });
    if (!provider) {
      return errorResponse('Service provider profile not found', 404);
    }

    const earnings = await serviceService.getEarnings({
      providerId: provider.id,
    });

    return successResponse(earnings, 'Earnings retrieved successfully');
  } catch (error) {
    console.error('Get earnings error:', error);
    return errorResponse('Failed to get earnings', 500);
  }
});
