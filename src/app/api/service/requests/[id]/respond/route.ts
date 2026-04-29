import { NextRequest } from 'next/server';
import { withAuth } from '@/lib/auth/middleware';
import { JWTPayload } from '@/lib/auth/jwt';
import { successResponse, errorResponse } from '@/lib/response';
import { serviceService } from '@/lib/services/serviceService';
import { prisma } from '@/lib/prisma';

/**
 * PATCH /api/service/requests/[id]/respond
 * Accept or reject a service request
 * Body: { action: "accept" | "reject" }
 */
export const PATCH = withAuth<{ id: string }>(async (request: NextRequest, user: JWTPayload, context) => {
  try {
    const { id } = await context!.params;
    const body = await request.json();

    if (!body.action || !['accept', 'reject'].includes(body.action)) {
      return errorResponse('Action must be "accept" or "reject"', 400);
    }

    const provider = await prisma.serviceProvider.findUnique({
      where: { userId: user.userId },
    });
    if (!provider) {
      return errorResponse('Service provider profile not found', 404);
    }

    const result = await serviceService.respondToRequest(id, provider.id, body.action);

    return successResponse(result, `Request ${body.action}ed successfully`);
  } catch (error) {
    console.error('Respond to request error:', error);
    const message = error instanceof Error ? error.message : 'Failed to respond to request';
    return errorResponse(message, 400);
  }
});
