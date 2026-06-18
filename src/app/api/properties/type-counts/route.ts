import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/lib/response";
import { ErrorCode } from "@/lib/auth/errors";

/**
 * GET /api/properties/type-counts
 * Public counts of active listings grouped by property type.
 */
export async function GET(_request: NextRequest) {
  try {
    const grouped = await prisma.property.groupBy({
      by: ["propertyType"],
      where: { status: "ACTIVE" },
      _count: { id: true },
    });

    const counts = grouped.reduce<Record<string, number>>((acc, row) => {
      acc[row.propertyType] = row._count.id;
      return acc;
    }, {});

    return successResponse({ counts }, "Property type counts retrieved");
  } catch (error) {
    console.error("Property type counts error:", error);
    return errorResponse(
      "Failed to load property type counts",
      500,
      ErrorCode.INTERNAL_SERVER_ERROR
    );
  }
}
