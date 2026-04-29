import { NextRequest } from 'next/server';
import { paymentService } from '@/lib/payments/paymentService';
import { withAuth } from '@/lib/auth/middleware';
import { successResponse, errorResponse } from '@/lib/response';
import { JWTPayload } from '@/lib/auth/jwt';
import { ErrorCode } from '@/lib/auth/errors';
import { ProcessRefundRequest } from '@/types/payment';

/**
 * POST /api/payments/:id/refund
 * Process a refund for a payment
 * Body: ProcessRefundRequest { reason: string, amount?: number }
 */
export const POST = withAuth<{ id: string }>(
  async (request: NextRequest, user: JWTPayload, context) => {
    try {
      const { id } = await context!.params;
      const data: ProcessRefundRequest = await request.json();

      if (!id) {
        return errorResponse('Payment ID is required', 400, ErrorCode.INVALID_INPUT);
      }

      // Validate required fields
      if (!data.reason) {
        return errorResponse('Reason field is required', 400, ErrorCode.VALIDATION_ERROR);
      }

      // Process refund
      const result = await paymentService.processRefund(id, data, user.userId);

      return successResponse(result, 'Refund processed successfully', 201);
    } catch (error: any) {
      console.error('POST /api/payments/:id/refund error:', error);
      if (error.message === 'Payment not found') {
        return errorResponse('Payment not found', 404, ErrorCode.RESOURCE_NOT_FOUND);
      }
      if (error.message === 'Unauthorized') {
        return errorResponse('Unauthorized', 403, ErrorCode.UNAUTHORIZED);
      }
      return errorResponse(error.message || 'Refund processing failed', 400);
    }
  }
);
