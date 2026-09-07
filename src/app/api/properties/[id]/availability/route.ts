import { NextRequest } from "next/server";
import { successResponse, errorResponse } from "@/lib/response";
import { ErrorCode } from "@/lib/auth/errors";
import { prisma } from "@/lib/prisma";
import { getBlockedDateRanges } from "@/lib/bookings/bookingAvailabilityQueries";

/**
 * GET /api/properties/[id]/availability
 * Returns paid booking date ranges that block the calendar.
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const property = await prisma.property.findUnique({
      where: { id },
      select: { id: true, rentalType: true, listingType: true },
    });

    if (!property) {
      return errorResponse("Property not found", 404, ErrorCode.RESOURCE_NOT_FOUND);
    }

    const blockedDateRanges = await getBlockedDateRanges(id);

    return successResponse(
      { propertyId: id, blockedDateRanges },
      "Availability retrieved"
    );
  } catch (error) {
    console.error("Get property availability error:", error);
    return errorResponse(
      "Failed to load availability",
      500,
      ErrorCode.INTERNAL_SERVER_ERROR
    );
  }
}
