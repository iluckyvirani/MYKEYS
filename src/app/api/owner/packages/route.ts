import { NextRequest } from 'next/server';
import { requireAuth, SELLER_ROLES, UserRole } from '@/lib/auth/middleware';
import { packageService } from '@/lib/packages/packageService';
import { successResponse, errorResponse } from '@/lib/response';
import { ErrorCode } from '@/lib/auth/errors';
import { PackageAudience } from '@/types/package';

function audienceForUser(role: string): PackageAudience {
  return role === UserRole.AGENT ? 'AGENT' : 'OWNER';
}

/**
 * GET /api/owner/packages
 * Get seller's current active Sale + Rent packages with usage
 */
export async function GET(request: NextRequest) {
  try {
    const authUser = await requireAuth(request);
    const audienceParam = request.nextUrl.searchParams.get('audience');
    const audience =
      audienceParam === 'AGENT' || audienceParam === 'OWNER'
        ? (audienceParam as PackageAudience)
        : audienceForUser(authUser.role);
    const packages = await packageService.getOwnerActivePackages(
      authUser.userId,
      audience
    );
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
