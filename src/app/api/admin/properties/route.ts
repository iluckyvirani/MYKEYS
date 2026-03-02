import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse, paginatedResponse } from "@/lib/response";
import { withAuth } from "@/lib/auth/middleware";
import { ErrorCode } from "@/lib/auth/errors";
import { JWTPayload } from "@/lib/auth/jwt";

/**
 * GET /api/admin/properties
 * Get all properties for admin dashboard with filters and pagination
 * Roles: ADMIN only
 * Query params: page, pageSize, status, propertyType, city, ownerId, minPrice, maxPrice, search, sortBy, sortOrder
 */
export const GET = withAuth(
  async (request: NextRequest, user: JWTPayload) => {
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
      const status = searchParams.get("status");
      const propertyType = searchParams.get("propertyType");
      const city = searchParams.get("city");
      const ownerId = searchParams.get("ownerId");
      const minPrice = searchParams.get("minPrice");
      const maxPrice = searchParams.get("maxPrice");
      const search = searchParams.get("search");

      // Build where clause
      const where: any = {};

      if (status && status !== "ALL") where.status = status;
      if (propertyType && propertyType !== "ALL") where.propertyType = propertyType;
      if (city) where.city = { contains: city, mode: "insensitive" };
      if (ownerId) where.ownerId = ownerId;

      if (minPrice || maxPrice) {
        where.price = {};
        if (minPrice) where.price.gte = parseFloat(minPrice);
        if (maxPrice) where.price.lte = parseFloat(maxPrice);
      }

      if (search) {
        where.OR = [
          { title: { contains: search, mode: "insensitive" } },
          { address: { contains: search, mode: "insensitive" } },
          { city: { contains: search, mode: "insensitive" } },
          { owner: { email: { contains: search, mode: "insensitive" } } },
        ];
      }

      // Build orderBy clause
      const orderBy: any = {};
      if (sortBy === "price") {
        orderBy.price = sortOrder;
      } else if (sortBy === "title") {
        orderBy.title = sortOrder;
      } else if (sortBy === "city") {
        orderBy.city = sortOrder;
      } else if (sortBy === "rating") {
        orderBy.avgRating = sortOrder;
      } else {
        orderBy.createdAt = sortOrder;
      }

      // Get properties with pagination
      const [properties, total] = await Promise.all([
        prisma.property.findMany({
          where,
          skip,
          take: pageSize,
          orderBy,
          include: {
            owner: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
            images: {
              select: {
                id: true,
                imageUrl: true,
                isPrimary: true,
              },
              take: 1,
            },
            _count: {
              select: {
                reviews: true,
                bookings: true,
              },
            },
          },
        }),
        prisma.property.count({ where }),
      ]);

      // Transform data to DTO format
      const propertyDTOs = properties.map((p: any) => ({
        id: p.id,
        title: p.title,
        address: p.address,
        city: p.city,
        state: p.state,
        zipCode: p.zipCode,
        propertyType: p.propertyType,
        listingType: p.listingType,
        status: p.status,
        price: p.price,
        bedrooms: p.bedrooms,
        bathrooms: p.bathrooms,
        area: p.area,
        amenities: p.amenities,
        description: p.description,
        ownerId: p.ownerId,
        ownerName: `${p.owner?.firstName} ${p.owner?.lastName}`,
        ownerEmail: p.owner?.email,
        images: p.images,
        avgRating: p.avgRating || 0,
        reviewsCount: p._count.reviews,
        bookingsCount: p._count.bookings,
        createdAt: p.createdAt,
        updatedAt: p.updatedAt,
      }));

      return paginatedResponse(
        propertyDTOs,
        total,
        page,
        pageSize,
        "Properties retrieved successfully"
      );
    } catch (error) {
      console.error("Get admin properties error:", error);
      return errorResponse(
        "Failed to retrieve properties",
        500,
        ErrorCode.INTERNAL_SERVER_ERROR
      );
    }
  },
  { roles: ["ADMIN" as any] }
);

/**
 * PATCH /api/admin/properties
 * Update property status or details
 * Body: { propertyId: string, status?: string, notes?: string }
 * Roles: ADMIN only
 */
export const PATCH = withAuth(
  async (request: NextRequest, user: JWTPayload) => {
    try {
      const { propertyId, status, notes } = await request.json();

      if (!propertyId) {
        return errorResponse("propertyId is required", 400);
      }

      const updateData: any = {};
      if (status) updateData.status = status;
      if (notes) updateData.adminNotes = notes;

      if (Object.keys(updateData).length === 0) {
        return errorResponse("At least one field to update is required", 400);
      }

      const validStatuses = [
        "DRAFT",
        "PENDING_REVIEW",
        "ACTIVE",
        "INACTIVE",
        "SOLD",
        "RENTED",
        "MAINTENANCE",
      ];

      if (status && !validStatuses.includes(status)) {
        return errorResponse(
          `Invalid status. Must be one of: ${validStatuses.join(", ")}`,
          400
        );
      }

      const updatedProperty = await prisma.property.update({
        where: { id: propertyId },
        data: updateData,
        include: {
          owner: { select: { firstName: true, lastName: true, email: true } },
        },
      });

      return successResponse(
        updatedProperty,
        "Property updated successfully"
      );
    } catch (error: any) {
      console.error("Update property error:", error);
      if (error.code === "P2025") {
        return errorResponse("Property not found", 404);
      }
      return errorResponse(
        error.message || "Failed to update property",
        500,
        ErrorCode.INTERNAL_SERVER_ERROR
      );
    }
  },
  { roles: ["ADMIN" as any] }
);
