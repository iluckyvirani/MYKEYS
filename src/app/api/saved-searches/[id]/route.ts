import { NextRequest } from "next/server";
import { successResponse, errorResponse } from "@/lib/response";
import { requireAuth } from "@/lib/auth/middleware";
import {
  deleteSavedSearch,
  updateSavedSearch,
} from "@/lib/savedSearches/service";
import { AlertFrequency } from "@prisma/client";

/**
 * PATCH /api/saved-searches/[id]
 * Update alert settings for a saved search.
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth(request);
    const { id } = await params;
    if (!id) {
      return errorResponse("ID is required", 400, "MISSING_ID");
    }

    const body = await request.json();
    const allowedFreq: AlertFrequency[] = [
      "INSTANTLY",
      "DAILY",
      "EVERY_3_DAYS",
      "EVERY_7_DAYS",
    ];

    let alertFrequency: AlertFrequency | null | undefined = undefined;
    if (body.alertFrequency !== undefined) {
      if (body.alertFrequency === null || body.alertFrequency === "") {
        alertFrequency = null;
      } else if (allowedFreq.includes(body.alertFrequency)) {
        alertFrequency = body.alertFrequency;
      } else {
        return errorResponse("Invalid alert frequency", 400, "INVALID_FREQUENCY");
      }
    }

    const updated = await updateSavedSearch(user.userId, id, {
      ...(body.alertEnabled !== undefined && {
        alertEnabled: !!body.alertEnabled,
      }),
      ...(alertFrequency !== undefined && { alertFrequency }),
      ...(typeof body.name === "string" && { name: body.name }),
    });

    return successResponse(updated, "Saved search updated");
  } catch (error: any) {
    if (error.message === "UNAUTHORIZED") {
      return errorResponse("Unauthorized", 401, "UNAUTHORIZED");
    }
    if (error.message === "Saved search not found") {
      return errorResponse("Saved search not found", 404, "NOT_FOUND");
    }
    return errorResponse(
      error.message || "Failed to update saved search",
      500,
      "UPDATE_SAVED_SEARCH_ERROR"
    );
  }
}

/**
 * DELETE /api/saved-searches/[id]
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth(request);
    const { id } = await params;
    if (!id) {
      return errorResponse("ID is required", 400, "MISSING_ID");
    }
    await deleteSavedSearch(user.userId, id);
    return successResponse({ id }, "Saved search removed");
  } catch (error: any) {
    if (error.message === "UNAUTHORIZED") {
      return errorResponse("Unauthorized", 401, "UNAUTHORIZED");
    }
    if (error.message === "Saved search not found") {
      return errorResponse("Saved search not found", 404, "NOT_FOUND");
    }
    return errorResponse(
      error.message || "Failed to delete saved search",
      500,
      "DELETE_SAVED_SEARCH_ERROR"
    );
  }
}
