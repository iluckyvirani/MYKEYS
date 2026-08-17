import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/auth/middleware';
import { packageService } from '@/lib/packages/packageService';
import { successResponse, errorResponse } from '@/lib/response';
import { ErrorCode } from '@/lib/auth/errors';
import { PackageCategory } from '@/types/package';

/**
 * GET /api/owner/packages/upgrade-options?category=SALE|RENT
 * Get available upgrade options for owner (within one category)
 */
export async function GET(request: NextRequest) {
  try {
    const authUser = await requireAuth(request);
    const categoryParam = (request.nextUrl.searchParams.get('category') || 'RENT').toUpperCase();
    const category: PackageCategory = categoryParam === 'SALE' ? 'SALE' : 'RENT';

    const upgradeOptions = await packageService.getUpgradeOptions(authUser.userId, category);
    const canUpgrade = await packageService.canUpgradePackage(authUser.userId, category);

    return successResponse(
      {
        category,
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
