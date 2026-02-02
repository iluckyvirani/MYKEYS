// src/app/api/favorites/remove/route.ts

import { NextRequest } from "next/server";
import { successResponse, errorResponse } from "@/lib/response";
import { requireAuth } from "@/lib/auth/middleware";
import { removeFavorite } from "@/lib/favorites/service";
import { RemoveFavoriteRequest } from "@/types/favorite";

/**
 * DELETE /api/favorites/remove
 * Remove a property from favorites
 * Body: { propertyId: string }
 */
export async function DELETE(request: NextRequest) {
  try {
    // Authenticate user
    const user = await requireAuth(request);

    // Parse request body
    const body: RemoveFavoriteRequest = await request.json();

    // Validate input
    if (!body.propertyId) {
      return errorResponse(
        "Property ID is required",
        400,
        "MISSING_PROPERTY_ID"
      );
    }

    // Remove from favorites
    await removeFavorite(user.userId, body.propertyId);

    return successResponse(
      null,
      "Property removed from favorites successfully"
    );
  } catch (error: any) {
    console.error("Error removing favorite:", error);

    if (error.message === "UNAUTHORIZED") {
      return errorResponse("Unauthorized", 401, "UNAUTHORIZED");
    }

    if (error.message === "Favorite not found") {
      return errorResponse("Favorite not found", 404, "FAVORITE_NOT_FOUND");
    }

    return errorResponse(
      error.message || "Failed to remove favorite",
      500,
      "REMOVE_FAVORITE_ERROR"
    );
  }
}