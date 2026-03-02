import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse, paginatedResponse } from "@/lib/response";
import { withAuth } from "@/lib/auth/middleware";
import { ErrorCode } from "@/lib/auth/errors";
import { JWTPayload } from "@/lib/auth/jwt";

/**
 * GET /api/admin/service-providers
 * Get all service providers for admin dashboard with filters and pagination
 * Roles: ADMIN only
 * Query params: page, pageSize, status, category, verified, search, sortBy, sortOrder
 */
export const GET = withAuth(
  async (request: NextRequest, _user: JWTPayload) => {
    try {
      const { searchParams } = new URL(request.url);

      // Pagination
      const page = parseInt(searchParams.get("page") || "1");
      const pageSize = parseInt(searchParams.get("pageSize") || "10");
      const skip = (page - 1) * pageSize;

      // Sorting
      const sortBy = searchParams.get("sortBy") || "createdAt";
      const sortOrder = (searchParams.get("sortOrder") || "desc") as "asc" | "desc";

      // Filters
      const status = searchParams.get("status"); // user status
      const verified = searchParams.get("verified"); // documentVerified
      const category = searchParams.get("category");
      const search = searchParams.get("search");

      // Build where clause for ServiceProvider
      const where: any = {};

      // Filter by document verification
      if (verified === "true") {
        where.documentVerified = true;
      } else if (verified === "false") {
        where.documentVerified = false;
      }

      // Filter by category
      if (category && category !== "ALL") {
        where.category = category.toUpperCase().replace(/-/g, "_");
      }

      // Filter by user status
      if (status && status !== "ALL") {
        where.user = {
          ...where.user,
          status: status,
        };
      }

      // Search filter
      if (search) {
        where.OR = [
          { user: { email: { contains: search, mode: "insensitive" } } },
          { user: { firstName: { contains: search, mode: "insensitive" } } },
          { user: { lastName: { contains: search, mode: "insensitive" } } },
          { user: { phone: { contains: search, mode: "insensitive" } } },
          { bio: { contains: search, mode: "insensitive" } },
        ];
      }

      // Build orderBy clause
      let orderBy: any = {};
      if (sortBy === "name") {
        orderBy = { user: { firstName: sortOrder } };
      } else if (sortBy === "email") {
        orderBy = { user: { email: sortOrder } };
      } else if (sortBy === "rating") {
        orderBy = { rating: sortOrder };
      } else {
        orderBy = { createdAt: sortOrder };
      }

      // Get service providers with pagination
      const [providers, total] = await Promise.all([
        prisma.serviceProvider.findMany({
          where,
          skip,
          take: pageSize,
          orderBy,
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                phone: true,
                status: true,
                avatar: true,
                city: true,
                state: true,
                createdAt: true,
              },
            },
            _count: {
              select: {
                bookings: true,
                serviceRequests: true,
                serviceReviews: true,
              },
            },
          },
        }),
        prisma.serviceProvider.count({ where }),
      ]);

      // Transform data to DTO format
      const providerDTOs = providers.map((p: any) => ({
        id: p.id,
        userId: p.user.id,
        firstName: p.user.firstName,
        lastName: p.user.lastName,
        email: p.user.email,
        phone: p.user.phone,
        status: p.user.status,
        verified: p.documentVerified,
        isActive: p.isActive,
        category: p.category,
        bio: p.bio,
        serviceAreas: p.serviceAreas,
        subcategories: p.subcategories,
        instantBookingEnabled: p.instantBookingEnabled,
        instantBookingPrice: p.instantBookingPrice,
        rating: p.rating,
        totalReviews: p.totalReviews,
        completedBookings: p.completedBookings,
        totalEarnings: p.totalEarnings,
        avatar: p.user.avatar,
        city: p.user.city,
        state: p.user.state,
        createdAt: p.createdAt,
        userCreatedAt: p.user.createdAt,
        totalBookings: p._count.bookings,
        totalRequests: p._count.serviceRequests,
      }));

      return paginatedResponse(
        providerDTOs,
        total,
        page,
        pageSize,
        "Service providers retrieved successfully"
      );
    } catch (error) {
      console.error("Get admin service providers error:", error);
      return errorResponse(
        "Failed to retrieve service providers",
        500,
        ErrorCode.INTERNAL_SERVER_ERROR
      );
    }
  },
  { roles: ["ADMIN" as any] }
);

/**
 * PATCH /api/admin/service-providers
 * Update service provider status or verification
 * Body: { providerId: string, status?: string, verified?: boolean }
 * - status: updates User.status (ACTIVE, INACTIVE, SUSPENDED)
 * - verified: updates ServiceProvider.documentVerified
 * Roles: ADMIN only
 */
export const PATCH = withAuth(
  async (request: NextRequest, _user: JWTPayload) => {
    try {
      const { providerId, userId, status, verified, isActive } = await request.json();

      // Support both providerId and userId for backwards compatibility
      const targetProviderId = providerId;
      const targetUserId = userId;

      if (!targetProviderId && !targetUserId) {
        return errorResponse("providerId or userId is required", 400);
      }

      // Find the service provider
      let provider;
      if (targetProviderId) {
        provider = await prisma.serviceProvider.findUnique({
          where: { id: targetProviderId },
          include: { user: true },
        });
      } else {
        provider = await prisma.serviceProvider.findUnique({
          where: { userId: targetUserId },
          include: { user: true },
        });
      }

      if (!provider) {
        return errorResponse("Service provider not found", 404);
      }

      // Update User status if provided
      if (status) {
        const validStatuses = ["ACTIVE", "INACTIVE", "SUSPENDED", "PENDING"];
        if (!validStatuses.includes(status)) {
          return errorResponse(
            `Invalid status. Must be one of: ${validStatuses.join(", ")}`,
            400
          );
        }

        await prisma.user.update({
          where: { id: provider.userId },
          data: { status },
        });
      }

      // Update ServiceProvider fields
      const providerUpdateData: any = {};
      
      if (verified !== undefined) {
        providerUpdateData.documentVerified = verified;
      }
      
      if (isActive !== undefined) {
        providerUpdateData.isActive = isActive;
      }

      let updatedProvider: any = provider;
      if (Object.keys(providerUpdateData).length > 0) {
        updatedProvider = await prisma.serviceProvider.update({
          where: { id: provider.id },
          data: providerUpdateData,
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                status: true,
              },
            },
            _count: {
              select: {
                bookings: true,
                serviceRequests: true,
              },
            },
          },
        });
      }

      // Refetch if only user status was updated
      if (status && Object.keys(providerUpdateData).length === 0) {
        updatedProvider = await prisma.serviceProvider.findUnique({
          where: { id: provider.id },
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                status: true,
              },
            },
            _count: {
              select: {
                bookings: true,
                serviceRequests: true,
              },
            },
          },
        }) as any;
      }

      return successResponse(
        {
          id: updatedProvider!.id,
          odid: updatedProvider!.userId,
          firstName: updatedProvider!.user.firstName,
          lastName: updatedProvider!.user.lastName,
          email: updatedProvider!.user.email,
          status: updatedProvider!.user.status,
          verified: updatedProvider!.documentVerified,
          isActive: updatedProvider!.isActive,
          category: updatedProvider!.category,
          rating: updatedProvider!.rating,
          totalReviews: updatedProvider!.totalReviews,
        },
        "Service provider updated successfully"
      );
    } catch (error: any) {
      console.error("Update service provider error:", error);
      if (error.code === "P2025") {
        return errorResponse("Service provider not found", 404);
      }
      return errorResponse(
        error.message || "Failed to update service provider",
        500,
        ErrorCode.INTERNAL_SERVER_ERROR
      );
    }
  },
  { roles: ["ADMIN" as any] }
);
