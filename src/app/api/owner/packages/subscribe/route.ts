import { NextRequest } from 'next/server';
import { requireRole, UserRole } from '@/lib/auth/middleware';
import { packageService } from '@/lib/packages/packageService';
import { successResponse, errorResponse } from '@/lib/response';
import { ErrorCode } from '@/lib/auth/errors';

/**
 * POST /api/owner/packages/subscribe
 * Owner buys a package. Body: { packageId: string }
 * After this, create a Razorpay payment order separately.
 */
export async function POST(request: NextRequest) {
  try {
    const authUser = await requireRole(request, [UserRole.OWNER, UserRole.ADMIN]);

    const body = await request.json();
    const { packageId } = body;

    if (!packageId) {
      return errorResponse('packageId is required', 400, ErrorCode.VALIDATION_ERROR);
    }

    const ownerPackage = await packageService.subscribeOwner(authUser.userId, packageId);
    return successResponse(ownerPackage, 'Successfully subscribed to package', 201);
  } catch (error: any) {
    console.error('Error subscribing to package:', error);
    const status = error.message === 'Package not found' ? 404 : 400;
    return errorResponse(error.message || 'Failed to subscribe to package', status, ErrorCode.VALIDATION_ERROR);
  }
}
