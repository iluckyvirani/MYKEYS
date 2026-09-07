// src/app/api/favorites/check/[propertyId]/route.ts

import { NextRequest } from "next/server";
import { successResponse, errorResponse } from "@/lib/response";
import { requireAuth } from "@/lib/auth/middleware";
import { checkFavorite } from "@/lib/favorites/service";

/**
 * GET /api/favorites/check/:propertyId
 * Check if a property is favorited by the user
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ propertyId: string }> }
) {
  try {
    // Authenticate user
    const user = await requireAuth(request);

    const { propertyId } = await params;

    if (!propertyId) {
      return errorResponse(
        "Property ID is required",
        400,
        "MISSING_PROPERTY_ID"
      );
    }

    // Check if favorited
    const result = await checkFavorite(user.userId, propertyId);

    return successResponse(result, "Favorite status retrieved successfully");
  } catch (error: any) {
    console.error("Error checking favorite:", error);

    if (error.message === "UNAUTHORIZED") {
      return errorResponse("Unauthorized", 401, "UNAUTHORIZED");
    }

    return errorResponse(
      error.message || "Failed to check favorite status",
      500,
      "CHECK_FAVORITE_ERROR"
    );
  }
}