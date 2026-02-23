// Example: Property Creation with Feature Gating
// File: src/app/api/properties/route.ts

import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { packageService } from "@/lib/packages/packageService";
import { errorResponse, successResponse } from "@/lib/response";
import { ErrorCode } from "@/types/error";

interface PropertyInput {
  title: string;
  description: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  propertyType: string;
  roomsCount: number;
  bathroomsCount: number;
  area: number;
  price: number;
  images?: string[];
  amenities?: string[];
}

export async function POST(request: NextRequest) {
  try {
    // Step 1: Authenticate user
    const user = await requireAuth(request);
    
    if (user.role !== "OWNER") {
      return errorResponse(
        "Only property owners can create listings",
        ErrorCode.FORBIDDEN,
        403
      );
    }

    // Step 2: Parse request body
    let propertyData: PropertyInput;
    try {
      propertyData = await request.json();
    } catch (error) {
      return errorResponse(
        "Invalid request body",
        ErrorCode.VALIDATION_ERROR,
        400
      );
    }

    // Step 3: Validate required fields
    const requiredFields = ["title", "description", "address", "city", "state", "zipCode", "propertyType"];
    const missingFields = requiredFields.filter((field) => !propertyData[field as keyof PropertyInput]);
    
    if (missingFields.length > 0) {
      return errorResponse(
        `Missing required fields: ${missingFields.join(", ")}`,
        ErrorCode.VALIDATION_ERROR,
        400
      );
    }

    // ===== FEATURE GATING: Check property limit =====
    try {
      const usage = await packageService.getOwnerPackageUsage(user.id);

      // Check 1: Hard limit - reject if at 100%
      if (usage.properties.percentage >= 100) {
        return errorResponse(
          {
            message: "Property limit reached. Upgrade your plan to add more properties.",
            current: usage.properties.used,
            limit: usage.properties.limit,
            percentage: usage.properties.percentage,
          },
          ErrorCode.RESOURCE_LIMIT_EXCEEDED,
          402 // Payment Required status
        );
      }

      // Check 2: Soft warning - log if approaching limit (80%+)
      if (usage.properties.percentage >= 80) {
        console.warn(
          `[USAGE WARNING] Owner ${user.id} approaching property limit: ${usage.properties.percentage}%`,
          {
            used: usage.properties.used,
            limit: usage.properties.limit,
          }
        );
        // Could also: Send email warning, or add response header
      }

      // Check 3: Storage validation - ensure uploading images won't exceed quota
      if (propertyData.images && propertyData.images.length > 0) {
        // Assuming average image is 2MB
        const estimatedImageSizeGB = (propertyData.images.length * 2) / 1024 / 1024; // GB
        const storageAfterImages = usage.storage.usedGB + estimatedImageSizeGB;

        if (storageAfterImages > usage.storage.limitGB) {
          return errorResponse(
            {
              message: "Insufficient storage for property images. Please delete unused content or upgrade.",
              usedGB: usage.storage.usedGB,
              limitGB: usage.storage.limitGB,
              estimatedNeededGB: estimatedImageSizeGB,
            },
            ErrorCode.RESOURCE_LIMIT_EXCEEDED,
            402
          );
        }
      }
    } catch (error: any) {
      // If unable to check package usage (e.g., payment failed), fail safely
      console.error("[CRITICAL] Failed to check package usage:", error);
      return errorResponse(
        "Unable to verify package limits. Please try again.",
        ErrorCode.INTERNAL_SERVER_ERROR,
        500
      );
    }

    // ===== CREATE PROPERTY =====
    try {
      const property = await prisma.property.create({
        data: {
          ownerId: user.id,
          title: propertyData.title,
          description: propertyData.description,
          address: propertyData.address,
          city: propertyData.city,
          state: propertyData.state,
          zipCode: propertyData.zipCode,
          propertyType: propertyData.propertyType,
          roomsCount: propertyData.roomsCount,
          bathroomsCount: propertyData.bathroomsCount,
          area: propertyData.area,
          price: propertyData.price,
          images: propertyData.images || [],
          amenities: propertyData.amenities || [],
          status: "ACTIVE",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });

      // ===== UPDATE USAGE TRACKING =====
      try {
        await packageService.incrementPropertyUsage(user.id);
        console.log(`[USAGE] Owner ${user.id} property created. Incremented count.`);
      } catch (error) {
        console.error("[WARNING] Failed to update usage tracking:", error);
        // Don't fail the response - property was created successfully
        // Just log the usage update failure
      }

      // ===== SUCCESS RESPONSE =====
      return successResponse(
        {
          ...property,
          // Optionally include usage info
          usage: {
            propertiesUsed: property.ownerId, // This would come from usage query in real scenario
            message: "Property created successfully",
          },
        },
        "Property created successfully",
        201,
        {
          "X-Created-ID": property.id,
        } // Custom headers if needed
      );
    } catch (error: any) {
      // Database or other creation errors
      if (error.code === "P2002") {
        // Unique constraint violation
        return errorResponse(
          "A property with this information already exists",
          ErrorCode.VALIDATION_ERROR,
          400
        );
      }

      console.error("[ERROR] Property creation failed:", error);
      return errorResponse(
        "Failed to create property. Please try again.",
        ErrorCode.INTERNAL_SERVER_ERROR,
        500
      );
    }
  } catch (error: any) {
    // Authentication or envelope errors
    if (error.message === "Unauthorized") {
      return errorResponse(
        "Please log in to create a property",
        ErrorCode.UNAUTHORIZED,
        401
      );
    }

    console.error("[ERROR] Unexpected error in POST /properties:", error);
    return errorResponse(
      "An unexpected error occurred",
      ErrorCode.INTERNAL_SERVER_ERROR,
      500
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Get query parameters
    const { searchParams } = new URL(request.url);
    const ownerId = searchParams.get("ownerId");
    const city = searchParams.get("city");
    const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 100);
    const offset = parseInt(searchParams.get("offset") || "0");

    // Build where clause
    const whereClause: any = { status: "ACTIVE" };
    
    if (ownerId) {
      whereClause.ownerId = ownerId;
    }
    
    if (city) {
      whereClause.city = { contains: city, mode: "insensitive" };
    }

    // Fetch properties
    const properties = await prisma.property.findMany({
      where: whereClause,
      take: limit,
      skip: offset,
      select: {
        id: true,
        title: true,
        description: true,
        address: true,
        city: true,
        price: true,
        images: true,
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        createdAt: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const total = await prisma.property.count({ where: whereClause });

    return successResponse(
      {
        properties,
        pagination: {
          total,
          limit,
          offset,
          hasMore: offset + limit < total,
        },
      },
      "Properties fetched successfully"
    );
  } catch (error) {
    console.error("[ERROR] Failed to fetch properties:", error);
    return errorResponse(
      "Failed to fetch properties",
      ErrorCode.INTERNAL_SERVER_ERROR,
      500
    );
  }
}
