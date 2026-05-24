import { NextRequest } from 'next/server';
import { requireRole, UserRole } from '@/lib/auth/middleware';
import { packageService } from '@/lib/packages/packageService';
import { successResponse, errorResponse } from '@/lib/response';
import { ErrorCode } from '@/lib/auth/errors';

/**
 * POST /api/owner/packages/subscribe
 * Creates a PENDING OwnerPackage and returns the ownerPackageId + price.
 * The caller must then open the Stripe payment modal and pay.
 * The package is activated inside confirmPayment() after payment succeeds.
 * Body: { packageId: string }
 */
export async function POST(request: NextRequest) {
  try {
    const authUser = await requireRole(request, [UserRole.OWNER, UserRole.ADMIN]);

    const body = await request.json();
    const { packageId } = body;

    if (!packageId) {
      return errorResponse('packageId is required', 400, ErrorCode.VALIDATION_ERROR);
    }

    const result = await packageService.createPendingSubscription(authUser.userId, packageId);
    return successResponse(result, 'Subscription initiated — complete payment to activate', 201);
  } catch (error: any) {
    console.error('Error initiating package subscription:', error);
    const status = error.message === 'Package not found' ? 404 : 400;
    return errorResponse(error.message || 'Failed to initiate package subscription', status, ErrorCode.VALIDATION_ERROR);
  }
}
