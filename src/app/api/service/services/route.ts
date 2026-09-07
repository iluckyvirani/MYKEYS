import { NextRequest } from 'next/server';
import { withAuth } from '@/lib/auth/middleware';
import { JWTPayload } from '@/lib/auth/jwt';
import { successResponse, errorResponse, paginatedResponse } from '@/lib/response';
import { serviceService } from '@/lib/services/serviceService';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/service/services
 * Get all services (listings) for the authenticated provider
 */
export const GET = withAuth(async (request: NextRequest, user: JWTPayload) => {
  try {
    const provider = await prisma.serviceProvider.findUnique({
      where: { userId: user.userId },
    });
    if (!provider) {
      return errorResponse('Service provider profile not found', 404);
    }

    const listings = await serviceService.getListings(provider.id);

    return successResponse(listings, 'Services retrieved successfully');
  } catch (error) {
    console.error('Get services error:', error);
    return errorResponse('Failed to get services', 500);
  }
});

/**
 * POST /api/service/services
 * Create a new service listing
 */
export const POST = withAuth(async (request: NextRequest, user: JWTPayload) => {
  try {
    const body = await request.json();

    if (!body.name || !body.basePrice) {
      return errorResponse('Missing required fields: name, basePrice', 400);
    }

    const provider = await prisma.serviceProvider.findUnique({
      where: { userId: user.userId },
    });
    if (!provider) {
      return errorResponse('Service provider profile not found', 404);
    }

    const listing = await serviceService.createListing(provider.id, {
      name: body.name,
      category: provider.category,
      description: body.description,
      basePrice: body.basePrice,
      image: body.image,
      status: body.status,
    });

    return successResponse(listing, 'Service created successfully', 201);
  } catch (error) {
    console.error('Create service error:', error);
    const message = error instanceof Error ? error.message : 'Failed to create service';
    return errorResponse(message, 400);
  }
});
