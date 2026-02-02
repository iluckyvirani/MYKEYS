// src/app/api/favorites/toggle/route.ts

import { NextRequest } from "next/server";
import { successResponse, errorResponse } from "@/lib/response";
import { requireAuth } from "@/lib/auth/middleware";
import { toggleFavorite } from "@/lib/favorites/service";

/**
 * POST /api/favorites/toggle
 * Toggle favorite status (add if not exists, remove if exists)
 * Body: { propertyId: string }
 */
export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const user = await requireAuth(request);

    // Parse request body
    const body = await request.json();

    // Validate input
    if (!body.propertyId) {
      return errorResponse(
        "Property ID is required",
        400,
        "MISSING_PROPERTY_ID"
      );
    }

    // Toggle favorite
    const result = await toggleFavorite(user.userId, body.propertyId);

    const message =
      result.action === "added"
        ? "Property added to favorites successfully"
        : "Property removed from favorites successfully";

    return successResponse(result, message);
  } catch (error: any) {
    console.error("Error toggling favorite:", error);

    if (error.message === "UNAUTHORIZED") {
      return errorResponse("Unauthorized", 401, "UNAUTHORIZED");
    }

    if (error.message === "Property not found") {
      return errorResponse("Property not found", 404, "PROPERTY_NOT_FOUND");
    }

    return errorResponse(
      error.message || "Failed to toggle favorite",
      500,
      "TOGGLE_FAVORITE_ERROR"
    );
  }
}