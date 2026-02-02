// src/app/api/favorites/route.ts

import { NextRequest } from "next/server";
import { successResponse, errorResponse, paginatedResponse } from "@/lib/response";
import { requireAuth } from "@/lib/auth/middleware";
import { getUserFavorites } from "@/lib/favorites/service";
import { FavoriteWithProperty } from "@/types/favorite";

/**
 * GET /api/favorites
 * Get user's favorite properties
 * Query params: page, pageSize
 */
export async function GET(request: NextRequest) {
  try {
    // Authenticate user
    const user = await requireAuth(request);

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = parseInt(searchParams.get("pageSize") || "10");

    // Get favorites
    const { items, total } = await getUserFavorites(user.userId, page, pageSize);

    // Calculate average rating for each property
    const favoritesWithRating = items.map((favorite: FavoriteWithProperty) => {
      const property = favorite.property;
      const avgRating =
        property.reviews.length > 0
          ? property.reviews.reduce((sum, r) => sum + r.rating, 0) /
            property.reviews.length
          : 0;

      return {
        ...favorite,
        property: {
          ...property,
          averageRating: Math.round(avgRating * 10) / 10,
          reviewCount: property.reviews.length,
        },
      };
    });

    return paginatedResponse(
      favoritesWithRating,
      total,
      page,
      pageSize,
      "Favorites retrieved successfully"
    );
  } catch (error: any) {
    console.error("Error fetching favorites:", error);

    if (error.message === "UNAUTHORIZED") {
      return errorResponse("Unauthorized", 401, "UNAUTHORIZED");
    }

    return errorResponse(
      error.message || "Failed to fetch favorites",
      500,
      "FETCH_FAVORITES_ERROR"
    );
  }
}