import { NextRequest } from 'next/server';
import { withAuth } from '@/lib/auth/middleware';
import { JWTPayload } from '@/lib/auth/jwt';
import { successResponse, errorResponse } from '@/lib/response';
import { serviceService } from '@/lib/services/serviceService';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/service/services/[id]
 * Get a single service listing
 */
export const GET = withAuth<{ params: Promise<{ id: string }> }>(async (request: NextRequest, user: JWTPayload, context) => {
  try {
    const { id } = await context!.params;
    const listing = await serviceService.getListingById(id);
    if (!listing) {
      return errorResponse('Service not found', 404);
    }
    return successResponse(listing, 'Service retrieved successfully');
  } catch (error) {
    console.error('Get service error:', error);
    return errorResponse('Failed to get service', 500);
  }
});

/**
 * PUT /api/service/services/[id]
 * Update a service listing
 */
export const PUT = withAuth<{ params: Promise<{ id: string }> }>(async (request: NextRequest, user: JWTPayload, context) => {
  try {
    const { id } = await context!.params;
    const body = await request.json();

    const provider = await prisma.serviceProvider.findUnique({
      where: { userId: user.userId },
    });
    if (!provider) {
      return errorResponse('Service provider profile not found', 404);
    }

    const updated = await serviceService.updateListing(id, provider.id, {
      name: body.name,
      category: body.category,
      description: body.description,
      basePrice: body.basePrice,
      image: body.image,
      status: body.status,
    });

    return successResponse(updated, 'Service updated successfully');
  } catch (error) {
    console.error('Update service error:', error);
    const message = error instanceof Error ? error.message : 'Failed to update service';
    return errorResponse(message, 400);
  }
});

/**
 * DELETE /api/service/services/[id]
 * Delete a service listing
 */
export const DELETE = withAuth<{ params: Promise<{ id: string }> }>(async (request: NextRequest, user: JWTPayload, context) => {
  try {
    const { id } = await context!.params;

    const provider = await prisma.serviceProvider.findUnique({
      where: { userId: user.userId },
    });
    if (!provider) {
      return errorResponse('Service provider profile not found', 404);
    }

    await serviceService.deleteListing(id, provider.id);

    return successResponse(null, 'Service deleted successfully');
  } catch (error) {
    console.error('Delete service error:', error);
    const message = error instanceof Error ? error.message : 'Failed to delete service';
    return errorResponse(message, 400);
  }
});
