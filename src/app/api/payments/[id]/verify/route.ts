import { NextRequest } from 'next/server';
import { paymentService } from '@/lib/payments/paymentService';
import { withAuth } from '@/lib/auth/middleware';
import { successResponse, errorResponse } from '@/lib/response';
import { JWTPayload } from '@/lib/auth/jwt';
import { ErrorCode } from '@/lib/auth/errors';
import { ConfirmPaymentRequest } from '@/types/payment';

/**
 * POST /api/payments/:id/verify
 * Confirm a Stripe payment by retrieving the PaymentIntent and verifying its status.
 * Body: ConfirmPaymentRequest { stripePaymentIntentId?: string }
 */
export const POST = withAuth<{ id: string }>(
  async (request: NextRequest, user: JWTPayload, context) => {
    try {
      const { id } = await context!.params;
      const data: ConfirmPaymentRequest = await request.json();

      if (!id) {
        return errorResponse('Payment ID is required', 400, ErrorCode.INVALID_INPUT);
      }

      const result = await paymentService.confirmPayment(id, data, user.userId);

      if (!result.success) {
        return errorResponse(result.message, 400);
      }

      return successResponse(result, 'Payment confirmed successfully');
    } catch (error: any) {
      console.error('POST /api/payments/:id/verify error:', error);
      if (error.message === 'Payment not found') {
        return errorResponse('Payment not found', 404, ErrorCode.RESOURCE_NOT_FOUND);
      }
      if (error.message === 'Unauthorized') {
        return errorResponse('Unauthorized', 403, ErrorCode.UNAUTHORIZED);
      }
      return errorResponse(error.message || 'Payment confirmation failed', 400);
    }
  }
);
