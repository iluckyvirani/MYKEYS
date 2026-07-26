import { NextRequest } from "next/server";
import { successResponse, errorResponse } from "@/lib/response";
import { requireAuth } from "@/lib/auth/middleware";
import {
  createSavedSearch,
  listSavedSearches,
} from "@/lib/savedSearches/service";
import { AlertFrequency, ListingType, RentalType } from "@prisma/client";

/**
 * GET /api/saved-searches
 */
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    const items = await listSavedSearches(user.userId);
    return successResponse({ items }, "Saved searches retrieved");
  } catch (error: any) {
    if (error.message === "UNAUTHORIZED") {
      return errorResponse("Unauthorized", 401, "UNAUTHORIZED");
    }
    return errorResponse(
      error.message || "Failed to fetch saved searches",
      500,
      "FETCH_SAVED_SEARCHES_ERROR"
    );
  }
}

/**
 * POST /api/saved-searches
 * Body: { location, listingType, rentalType?, filters?, alertEnabled?, alertFrequency?, name? }
 */
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    const body = await request.json();

    if (!body.location || !String(body.location).trim()) {
      return errorResponse("Location is required", 400, "MISSING_LOCATION");
    }

    const listingType = (body.listingType || "BUY") as ListingType;
    if (listingType !== "BUY" && listingType !== "RENT") {
      return errorResponse("Invalid listingType", 400, "INVALID_LISTING_TYPE");
    }

    let rentalType: RentalType | null = null;
    if (listingType === "RENT") {
      rentalType =
        body.rentalType === "SHORT_TERM" ? "SHORT_TERM" : "LONG_TERM";
    }

    const alertEnabled = !!body.alertEnabled;
    const allowedFreq: AlertFrequency[] = [
      "INSTANTLY",
      "DAILY",
      "EVERY_3_DAYS",
      "EVERY_7_DAYS",
    ];
    let alertFrequency: AlertFrequency | null = null;
    if (alertEnabled) {
      alertFrequency = allowedFreq.includes(body.alertFrequency)
        ? body.alertFrequency
        : "INSTANTLY";
    }

    const saved = await createSavedSearch({
      userId: user.userId,
      name: body.name,
      listingType,
      rentalType,
      location: String(body.location),
      filters: body.filters && typeof body.filters === "object" ? body.filters : {},
      alertEnabled,
      alertFrequency,
    });

    return successResponse(
      saved,
      alertEnabled ? "Alert created successfully" : "Search saved successfully",
      201
    );
  } catch (error: any) {
    console.error("Error creating saved search:", error);
    if (error.message === "UNAUTHORIZED") {
      return errorResponse("Unauthorized", 401, "UNAUTHORIZED");
    }
    return errorResponse(
      error.message || "Failed to save search",
      500,
      "CREATE_SAVED_SEARCH_ERROR"
    );
  }
}
