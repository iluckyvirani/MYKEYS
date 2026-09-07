// src/app/api/favorites/add/route.ts

import { NextRequest } from "next/server";
import { successResponse, errorResponse } from "@/lib/response";
import { requireAuth } from "@/lib/auth/middleware";
import { addFavorite } from "@/lib/favorites/service";
import { AddFavoriteRequest } from "@/types/favorite";

/**
 * POST /api/favorites/add
 * Add a property to favorites
 * Body: { propertyId: string }
 */
export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const user = await requireAuth(request);

    // Parse request body
    const body: AddFavoriteRequest = await request.json();

    // Validate input
    if (!body.propertyId) {
      return errorResponse(
        "Property ID is required",
        400,
        "MISSING_PROPERTY_ID"
      );
    }

    // Add to favorites
    const favorite = await addFavorite(user.userId, body.propertyId);

    return successResponse(
      favorite,
      "Property added to favorites successfully",
      201
    );
  } catch (error: any) {
    console.error("Error adding favorite:", error);

    if (error.message === "UNAUTHORIZED") {
      return errorResponse("Unauthorized", 401, "UNAUTHORIZED");
    }

    if (error.message === "Property not found") {
      return errorResponse("Property not found", 404, "PROPERTY_NOT_FOUND");
    }

    if (error.message === "Property already in favorites") {
      return errorResponse(
        "Property already in favorites",
        400,
        "ALREADY_FAVORITED"
      );
    }

    return errorResponse(
      error.message || "Failed to add favorite",
      500,
      "ADD_FAVORITE_ERROR"
    );
  }
}