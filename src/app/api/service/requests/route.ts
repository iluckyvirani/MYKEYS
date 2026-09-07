import { NextRequest } from 'next/server';
import { withAuth } from '@/lib/auth/middleware';
import { JWTPayload } from '@/lib/auth/jwt';
import { successResponse, errorResponse, paginatedResponse } from '@/lib/response';
import { serviceService } from '@/lib/services/serviceService';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/service/requests
 * Get service requests for the authenticated service provider
 * Query params: status, page, limit
 */
export const GET = withAuth(async (request: NextRequest, user: JWTPayload) => {
  try {
    const provider = await prisma.serviceProvider.findUnique({
      where: { userId: user.userId },
    });
    if (!provider) {
      return errorResponse('Service provider profile not found', 404);
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || undefined;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    const result = await serviceService.getRequests({
      providerId: provider.id,
      status,
      page,
      limit,
    });

    return paginatedResponse(result.items, result.total, result.page, result.limit, 'Requests retrieved successfully');
  } catch (error) {
    console.error('Get service requests error:', error);
    return errorResponse('Failed to get requests', 500);
  }
});

/**
 * POST /api/service/requests
 * Create a new service request (by client)
 */
export const POST = withAuth(async (request: NextRequest, user: JWTPayload) => {
  try {
    const body = await request.json();

    if (!body.providerId || !body.serviceType) {
      return errorResponse('Missing required fields: providerId, serviceType', 400);
    }

    const request_ = await serviceService.createRequest({
      clientId: user.userId,
      providerId: body.providerId,
      serviceType: body.serviceType,
      description: body.description,
      location: body.location,
      budget: body.budget,
      urgency: body.urgency,
    });

    return successResponse(request_, 'Request created successfully', 201);
  } catch (error) {
    console.error('Create service request error:', error);
    const message = error instanceof Error ? error.message : 'Failed to create request';
    return errorResponse(message, 400);
  }
});
