import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/auth/middleware';
import { packageService } from '@/lib/packages/packageService';
import { successResponse, errorResponse } from '@/lib/response';
import { ErrorCode } from '@/lib/auth/errors';

/**
 * GET /api/owner/packages
 * Get owner's current active package with usage
 */
export async function GET(request: NextRequest) {
  try {
    const authUser = await requireAuth(request);
    const ownerPackage = await packageService.getOwnerActivePackage(authUser.userId);
    return successResponse(ownerPackage, ownerPackage ? 'Active package retrieved' : 'No active package', 200);
  } catch (error: any) {
    console.error('Error fetching owner package:', error);
    return errorResponse(error.message || 'Failed to fetch owner package', 500, ErrorCode.INTERNAL_SERVER_ERROR);
  }
}
