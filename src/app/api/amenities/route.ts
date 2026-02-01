import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse, paginatedResponse } from "@/lib/response";
import { withAuth } from "@/lib/auth/middleware";
import { ErrorCode } from "@/lib/auth/errors";
import { JWTPayload } from "@/lib/auth/jwt";

/**
 * GET /api/amenities
 * Get all amenities with optional filters and pagination
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Pagination
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = parseInt(searchParams.get("pageSize") || "50");
    const skip = (page - 1) * pageSize;

    // Filters
    const search = searchParams.get("search");
    const category = searchParams.get("category");

    // Build where clause
    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { category: { contains: search, mode: "insensitive" } },
      ];
    }

    if (category) {
      where.category = { contains: category, mode: "insensitive" };
    }

    // Get amenities with pagination
    const [amenities, total] = await Promise.all([
      prisma.amenity.findMany({
        where,
        skip,
        take: pageSize,
        include: {
          properties: {
            select: {
              propertyId: true,
            },
          },
        },
        orderBy: {
          name: "asc",
        },
      }),
      prisma.amenity.count({ where }),
    ]);

    // Format response with property count
    const amenitiesWithCount = amenities.map((amenity: any) => ({
      ...amenity,
      propertyCount: amenity.properties.length,
      properties: undefined, // Remove properties array from response
    }));

    return paginatedResponse(
      amenitiesWithCount,
      total,
      page,
      pageSize,
      "Amenities retrieved successfully"
    );
  } catch (error) {
    console.error("Get amenities error:", error);
    return errorResponse(
      "Failed to retrieve amenities",
      500,
      ErrorCode.INTERNAL_SERVER_ERROR
    );
  }
}

/**
 * POST /api/amenities
 * Create a new amenity (Admin only)
 */
export const POST = withAuth(
  async (request: NextRequest, user: JWTPayload) => {
    try {
      const body = await request.json();

      // Validate required fields
      const { name, category } = body;

      if (!name || !category) {
        return errorResponse(
          "Name and category are required",
          400,
          ErrorCode.VALIDATION_ERROR
        );
      }

      // Check if amenity already exists
      const existingAmenity = await prisma.amenity.findUnique({
        where: { name },
      });

      if (existingAmenity) {
        return errorResponse(
          "Amenity with this name already exists",
          400,
          ErrorCode.VALIDATION_ERROR
        );
      }

      // Create amenity
      const amenity = await prisma.amenity.create({
        data: {
          name,
          category,
          icon: body.icon || null,
        },
      });

      return successResponse(amenity, "Amenity created successfully", 201);
    } catch (error) {
      console.error("Create amenity error:", error);
      return errorResponse(
        "Failed to create amenity",
        500,
        ErrorCode.INTERNAL_SERVER_ERROR
      );
    }
  },
  { roles: ["ADMIN" as any] }
);
