import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse, paginatedResponse } from "@/lib/response";
import { withAuth } from "@/lib/auth/middleware";
import { ErrorCode } from "@/lib/auth/errors";
import { JWTPayload } from "@/lib/auth/jwt";

/**
 * GET /api/properties
 * Get all properties with optional filters and pagination
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Pagination
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = parseInt(searchParams.get("pageSize") || "10");
    const skip = (page - 1) * pageSize;

    // Filters
    const status = searchParams.get("status");
    const listingType = searchParams.get("listingType");
    const propertyType = searchParams.get("propertyType");
    const city = searchParams.get("city");
    const state = searchParams.get("state");
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");
    const bedrooms = searchParams.get("bedrooms");
    const bathrooms = searchParams.get("bathrooms");

    // Build where clause
    const where: any = {};

    if (status) where.status = status;
    if (listingType) where.listingType = listingType;
    if (propertyType) where.propertyType = propertyType;
    if (city) where.city = { contains: city, mode: "insensitive" };
    if (state) where.state = { contains: state, mode: "insensitive" };
    
    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = parseFloat(minPrice);
      if (maxPrice) where.price.lte = parseFloat(maxPrice);
    }

    if (bedrooms) where.bedrooms = { gte: parseInt(bedrooms) };
    if (bathrooms) where.bathrooms = { gte: parseInt(bathrooms) };

    // Get properties with pagination
    const [properties, total] = await Promise.all([
      prisma.property.findMany({
        where,
        skip,
        take: pageSize,
        include: {
          owner: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              phone: true,
              companyName: true,
              avatar: true,
            },
          },
          images: true,
          amenities: {
            include: {
              amenity: true,
            },
          },
          reviews: {
            select: {
              rating: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      }),
      prisma.property.count({ where }),
    ]);

    // Calculate average rating for each property
    const propertiesWithRating = properties.map((property: any) => {
      const avgRating =
        property.reviews.length > 0
          ? property.reviews.reduce((sum: number, r: any) => sum + r.rating, 0) /
            property.reviews.length
          : 0;

      return {
        ...property,
        averageRating: Math.round(avgRating * 10) / 10,
        reviewCount: property.reviews.length,
      };
    });

    return paginatedResponse(
      propertiesWithRating,
      total,
      page,
      pageSize,
      "Properties retrieved successfully"
    );
  } catch (error) {
    console.error("Get properties error:", error);
    return errorResponse(
      "Failed to retrieve properties",
      500,
      ErrorCode.INTERNAL_SERVER_ERROR
    );
  }
}

/**
 * POST /api/properties
 * Create a new property (Owner/Admin only)
 */
export const POST = withAuth(
  async (request: NextRequest, user: JWTPayload) => {
    try {
      const body = await request.json();

      // Validate required fields
      const {
        title,
        description,
        address,
        city,
        state,
        country,
        zipCode,
        price,
        propertyType,
        listingType,
        bedrooms,
        bathrooms,
        area,
        amenities,
        images,
      } = body;

      if (!title || !address || !city || !state || !price || !propertyType || !listingType) {
        return errorResponse(
          "Missing required fields",
          400,
          ErrorCode.VALIDATION_ERROR
        );
      }

      // Create property
      const property = await prisma.property.create({
        data: {
          title,
          slug: title.toLowerCase().replace(/\s+/g, "-") + "-" + Date.now(),
          description,
          address,
          city,
          state,
          country: country || "India",
          zipCode,
          latitude: body.latitude,
          longitude: body.longitude,
          price,
          propertyType,
          listingType,
          rentalType: body.rentalType,
          bedrooms: bedrooms || 0,
          bathrooms: bathrooms || 0,
          area,
          furnished: body.furnished || false,
          parking: body.parking || false,
          petFriendly: body.petFriendly || false,
          status: "DRAFT",
          ownerId: user.userId,
          availableFrom: body.availableFrom ? new Date(body.availableFrom) : new Date(),
          // Create images if provided
          ...(images && images.length > 0 && {
            images: {
              create: images.map((img: any, index: number) => ({
                url: img.url,
                caption: img.caption || null,
                isPrimary: index === 0,
              })),
            },
          }),
          // Connect amenities if provided
          ...(amenities && amenities.length > 0 && {
            amenities: {
              create: amenities.map((amenityId: string) => ({
                amenityId,
              })),
            },
          }),
        },
        include: {
          images: true,
          amenities: {
            include: {
              amenity: true,
            },
          },
        },
      });

      return successResponse(property, "Property created successfully", 201);
    } catch (error) {
      console.error("Create property error:", error);
      return errorResponse(
        "Failed to create property",
        500,
        ErrorCode.INTERNAL_SERVER_ERROR
      );
    }
  },
  { roles: ["OWNER" as any, "ADMIN" as any] }
);
