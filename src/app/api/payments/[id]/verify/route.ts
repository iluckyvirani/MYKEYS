import { NextRequest } from 'next/server';
import { paymentService } from '@/lib/payments/paymentService';
import { withAuth } from '@/lib/auth/middleware';
import { successResponse, errorResponse } from '@/lib/response';
import { JWTPayload } from '@/lib/auth/jwt';
import { ErrorCode } from '@/lib/auth/errors';
import { VerifyPaymentRequest } from '@/types/payment';

/**
 * POST /api/payments/:id/verify
 * Verify a payment with Razorpay signature
 * Body: VerifyPaymentRequest
 */
export const POST = withAuth<{ params: Promise<{ id: string }> }>(
  async (request: NextRequest, user: JWTPayload, context) => {
    try {
      const { id } = await context!.params;
      const data: VerifyPaymentRequest = await request.json();

      if (!id) {
        return errorResponse('Payment ID is required', 400, ErrorCode.INVALID_INPUT);
      }

      // Validate required fields
      if (!data.razorpayOrderId || !data.razorpayPaymentId || !data.razorpaySignature) {
        return errorResponse(
          'razorpayOrderId, razorpayPaymentId, and razorpaySignature are required',
          400,
          ErrorCode.VALIDATION_ERROR
        );
      }

      // Verify payment
      const result = await paymentService.verifyPayment(id, data, user.userId);

      if (!result.success) {
        return errorResponse(result.message, 400);
      }

      return successResponse(result, 'Payment verified successfully');
    } catch (error: any) {
      console.error('POST /api/payments/:id/verify error:', error);
      if (error.message === 'Payment not found') {
        return errorResponse('Payment not found', 404, ErrorCode.RESOURCE_NOT_FOUND);
      }
      if (error.message === 'Unauthorized') {
        return errorResponse('Unauthorized', 403, ErrorCode.UNAUTHORIZED);
      }
      return errorResponse(error.message || 'Payment verification failed', 400);
    }
  }
);
