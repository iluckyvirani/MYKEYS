import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/auth/middleware';
import { packageService } from '@/lib/packages/packageService';
import { successResponse, errorResponse } from '@/lib/response';
import { ErrorCode } from '@/lib/auth/errors';

/**
 * POST /api/owner/packages/subscribe
 * Subscribe owner to a package
 */
export async function POST(request: NextRequest) {
  try {
    const authUser = await requireAuth(request);

    const body = await request.json();
    const { packageId, duration } = body;

    // Validation
    if (!packageId) {
      return errorResponse(
        'Package ID is required',
        400,
        ErrorCode.VALIDATION_ERROR
      );
    }

    if (!duration || !['monthly', 'yearly'].includes(duration)) {
      return errorResponse(
        'Duration must be either "monthly" or "yearly"',
        400,
        ErrorCode.VALIDATION_ERROR
      );
    }

    // Verify package exists
    const pkg = await packageService.getById(packageId);
    if (!pkg) {
      return errorResponse(
        'Package not found',
        404,
        ErrorCode.RESOURCE_NOT_FOUND
      );
    }

    // Subscribe owner
    const ownerPackage = await packageService.subscribeOwner(
      authUser.userId,
      packageId,
      duration
    );

    return successResponse(
      ownerPackage,
      "Successfully subscribed to package",
      201
    );
  } catch (error: any) {
    console.error('Error subscribing to package:', error);
    return errorResponse(
      error.message || 'Failed to subscribe to package',
      500,
      ErrorCode.INTERNAL_SERVER_ERROR
    );
  }
}
