import { NextRequest } from 'next/server';
import { withAuth } from '@/lib/auth/middleware';
import { JWTPayload } from '@/lib/auth/jwt';
import { successResponse, errorResponse } from '@/lib/response';
import { serviceService } from '@/lib/services/serviceService';
import { prisma } from '@/lib/prisma';

/**
 * PATCH /api/service/reviews/[id]/reply
 * Reply to a service review (by provider)
 * Body: { response: string }
 */
export const PATCH = withAuth<{ params: Promise<{ id: string }> }>(async (request: NextRequest, user: JWTPayload, context) => {
  try {
    const { id } = await context!.params;
    const body = await request.json();

    if (!body.response) {
      return errorResponse('Response text is required', 400);
    }

    const provider = await prisma.serviceProvider.findUnique({
      where: { userId: user.userId },
    });
    if (!provider) {
      return errorResponse('Service provider profile not found', 404);
    }

    const result = await serviceService.replyToReview(id, provider.id, body.response);

    return successResponse(result, 'Reply added successfully');
  } catch (error) {
    console.error('Reply to review error:', error);
    const message = error instanceof Error ? error.message : 'Failed to reply to review';
    return errorResponse(message, 400);
  }
});
