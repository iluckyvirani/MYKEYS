import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/auth/middleware';
import { packageService } from '@/lib/packages/packageService';
import { successResponse, errorResponse } from '@/lib/response';
import { ErrorCode } from '@/lib/auth/errors';

/**
 * GET /api/owner/packages/upgrade-options
 * Get available upgrade options for owner
 */
export async function GET(request: NextRequest) {
  try {
    const authUser = await requireAuth(request);

    const upgradeOptions = await packageService.getUpgradeOptions(authUser.userId);
    const canUpgrade = await packageService.canUpgradePackage(authUser.userId);

    return successResponse(
      {
        canUpgrade,
        availablePackages: upgradeOptions,
      },
      "Upgrade options retrieved successfully",
      200
    );
  } catch (error: any) {
    console.error('Error fetching upgrade options:', error);
    return errorResponse(
      error.message || 'Failed to fetch upgrade options',
      500,
      ErrorCode.INTERNAL_SERVER_ERROR
    );
  }
}
