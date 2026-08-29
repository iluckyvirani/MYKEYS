import { NextRequest } from 'next/server';
import { requireAuth, UserRole } from '@/lib/auth/middleware';
import { packageService } from '@/lib/packages/packageService';
import { successResponse, errorResponse } from '@/lib/response';
import { ErrorCode } from '@/lib/auth/errors';
import { PackageCategory, PackageAudience } from '@/types/package';

function audienceForUser(role: string): PackageAudience {
  return role === UserRole.AGENT ? 'AGENT' : 'OWNER';
}

/**
 * GET /api/owner/packages/upgrade-options?category=SALE|RENT
 * Get available upgrade options for owner (within one category)
 */
export async function GET(request: NextRequest) {
  try {
    const authUser = await requireAuth(request);
    const categoryParam = (request.nextUrl.searchParams.get('category') || 'RENT').toUpperCase();
    const category: PackageCategory = categoryParam === 'SALE' ? 'SALE' : 'RENT';
    const audience = audienceForUser(authUser.role);

    const upgradeOptions = await packageService.getUpgradeOptions(
      authUser.userId,
      category,
      audience
    );
    const canUpgrade = await packageService.canUpgradePackage(
      authUser.userId,
      category,
      audience
    );

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
