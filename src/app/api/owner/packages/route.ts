import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/auth/middleware';
import { packageService } from '@/lib/packages/packageService';
import { successResponse, errorResponse } from '@/lib/response';
import { ErrorCode } from '@/lib/auth/errors';

/**
 * GET /api/owner/packages
 * Get owner's current active Sale + Rent packages with usage
 */
export async function GET(request: NextRequest) {
  try {
    const authUser = await requireAuth(request);
    const packages = await packageService.getOwnerActivePackages(authUser.userId);
    const hasAny = Boolean(packages.SALE || packages.RENT);
    return successResponse(
      packages,
      hasAny ? 'Active packages retrieved' : 'No active packages',
      200
    );
  } catch (error: any) {
    console.error('Error fetching owner package:', error);
    return errorResponse(error.message || 'Failed to fetch owner package', 500, ErrorCode.INTERNAL_SERVER_ERROR);
  }
}
