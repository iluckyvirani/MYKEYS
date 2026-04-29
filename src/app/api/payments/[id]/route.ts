import { NextRequest } from 'next/server';
import { paymentService } from '@/lib/payments/paymentService';
import { withAuth } from '@/lib/auth/middleware';
import { successResponse, errorResponse } from '@/lib/response';
import { JWTPayload } from '@/lib/auth/jwt';
import { ErrorCode } from '@/lib/auth/errors';

/**
 * GET /api/payments/:id
 * Get a specific payment by ID
 */
export const GET = withAuth<{ id: string }>(
  async (request: NextRequest, user: JWTPayload, context) => {
    try {
      const { id } = await context!.params;

      if (!id) {
        return errorResponse('Payment ID is required', 400, ErrorCode.INVALID_INPUT);
      }

      const payment = await paymentService.getPaymentById(id, user.userId);

      return successResponse(payment, 'Payment retrieved successfully');
    } catch (error: any) {
      console.error('GET /api/payments/:id error:', error);
      if (error.message === 'Payment not found') {
        return errorResponse('Payment not found', 404, ErrorCode.RESOURCE_NOT_FOUND);
      }
      if (error.message === 'Unauthorized') {
        return errorResponse('Unauthorized', 403, ErrorCode.UNAUTHORIZED);
      }
      return errorResponse(error.message || 'Failed to fetch payment', 500);
    }
  }
);

/**
 * POST /api/payments/:id/verify
 * Verify a payment with Razorpay signature
 * This is handled by a separate route file
 */

/**
 * POST /api/payments/:id/refund
 * Process refund for a payment
 * This is handled by a separate route file
 */
