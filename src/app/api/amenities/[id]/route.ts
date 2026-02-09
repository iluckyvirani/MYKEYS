import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/lib/response";
import { withAuth } from "@/lib/auth/middleware";
import { ErrorCode } from "@/lib/auth/errors";
import { JWTPayload } from "@/lib/auth/jwt";

/**
 * GET /api/amenities/:id
 * Get a single amenity by ID
 */
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        const amenity = await prisma.amenity.findUnique({
            where: { id },
            include: {
                properties: {
                    select: {
                        propertyId: true,
                    },
                },
            },
        });

        if (!amenity) {
            return errorResponse("Amenity not found", 404, ErrorCode.RESOURCE_NOT_FOUND);
        }

        return successResponse(
            {
                ...amenity,
                propertyCount: amenity.properties.length,
                properties: undefined,
            },
            "Amenity retrieved successfully"
        );
    } catch (error) {
        console.error("Get amenity error:", error);
        return errorResponse(
            "Failed to retrieve amenity",
            500,
            ErrorCode.INTERNAL_SERVER_ERROR
        );
    }
}

/**
 * PUT /api/amenities/:id
 * Update an amenity (Admin only)
 */
export const PUT = withAuth<{ params: Promise<{ id: string }> }>(
    async (request: NextRequest, user: JWTPayload, context) => {
        const { id } = await context!.params;
        try {
            const body = await request.json();

            // Check if amenity exists
            const amenity = await prisma.amenity.findUnique({
                where: { id },
            });

            if (!amenity) {
                return errorResponse("Amenity not found", 404, ErrorCode.RESOURCE_NOT_FOUND);
            }

            // If name is being updated, check if it already exists
            if (body.name && body.name !== amenity.name) {
                const existingAmenity = await prisma.amenity.findUnique({
                    where: { name: body.name },
                });

                if (existingAmenity) {
                    return errorResponse(
                        "Amenity with this name already exists",
                        400,
                        ErrorCode.VALIDATION_ERROR
                    );
                }
            }

            // Update amenity
            const updatedAmenity = await prisma.amenity.update({
                where: { id },
                data: {
                    name: body.name || amenity.name,
                    category: body.category || amenity.category,
                    icon: body.icon !== undefined ? body.icon : amenity.icon,
                },
            });

            return successResponse(updatedAmenity, "Amenity updated successfully");
        } catch (error) {
            console.error("Update amenity error:", error);
            return errorResponse(
                "Failed to update amenity",
                500,
                ErrorCode.INTERNAL_SERVER_ERROR
            );
        }
    },
    { roles: ["ADMIN" as any] }
);

/**
 * DELETE /api/amenities/:id
 * Delete an amenity (Admin only)
 */
export const DELETE = withAuth<{ params: Promise<{ id: string }> }>(
    async (request: NextRequest, _user: JWTPayload, context) => {
        const { id } = await context!.params;
        try {
            // Check if amenity exists
            const amenity = await prisma.amenity.findUnique({
                where: { id },
            });

            if (!amenity) {
                return errorResponse("Amenity not found", 404, ErrorCode.RESOURCE_NOT_FOUND);
            }

            // Delete amenity (cascade will remove PropertyAmenity relations)
            await prisma.amenity.delete({
                where: { id },
            });

            return successResponse(null, "Amenity deleted successfully");
        } catch (error) {
            console.error("Delete amenity error:", error);
            return errorResponse(
                "Failed to delete amenity",
                500,
                ErrorCode.INTERNAL_SERVER_ERROR
            );
        }
    },
    { roles: ["ADMIN" as any] }
);
