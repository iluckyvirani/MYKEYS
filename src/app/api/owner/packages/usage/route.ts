import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/auth/middleware';
import { packageService } from '@/lib/packages/packageService';
import { successResponse, errorResponse } from '@/lib/response';
import { ErrorCode } from '@/lib/auth/errors';

/**
 * GET /api/owner/packages/usage
 * Get owner's Sale + Rent package usage statistics
 */
export async function GET(request: NextRequest) {
  try {
    const authUser = await requireAuth(request);

    const usage = await packageService.getOwnerPackageUsage(authUser.userId);

    return successResponse(usage, "Package usage retrieved successfully", 200);
  } catch (error: any) {
    console.error('Error fetching package usage:', error);
    return errorResponse(
      error.message || 'Failed to fetch package usage',
      500,
      ErrorCode.INTERNAL_SERVER_ERROR
    );
  }
}
