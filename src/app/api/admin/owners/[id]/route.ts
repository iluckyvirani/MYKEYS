import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/lib/response";
import { withAuth } from "@/lib/auth/middleware";
import { ErrorCode } from "@/lib/auth/errors";
import { JWTPayload } from "@/lib/auth/jwt";

export const GET = withAuth(
  async (request: NextRequest, user: JWTPayload) => {
    try {
      const ownerId = request.nextUrl.pathname.split("/").pop();

      if (!ownerId) {
        return errorResponse("Owner ID is required", 400, ErrorCode.VALIDATION_ERROR);
      }

      // Get owner with detailed information
      const ownerData = await prisma.user.findUnique({
        where: { id: ownerId },
        select: {
          id: true,
          email: true,
          phone: true,
          firstName: true,
          lastName: true,
          avatar: true,
          status: true,
          roles: { select: { role: true } },
          birthDate: true,
          address: true,
          city: true,
          state: true,
          country: true,
          zipCode: true,
          companyName: true,
          taxId: true,
          website: true,
          createdAt: true,
          updatedAt: true,
          lastLoginAt: true,
          _count: {
            select: {
              properties: true,
              bookingsAsOwner: true,
              reviews: true,
              payments: true,
            },
          },
        },
      });

      if (!ownerData) {
        return errorResponse("Owner not found", 404, ErrorCode.USER_NOT_FOUND);
      }

      // Verify this user is an OWNER
      const isOwner = ownerData.roles.some((r: any) => r.role === "OWNER");
      if (!isOwner) {
        return errorResponse("User is not an owner", 400, ErrorCode.VALIDATION_ERROR);
      }

      // Get owner's properties
      const properties = await prisma.property.findMany({
        where: { ownerId: ownerId },
        select: {
          id: true,
          title: true,
          city: true,
          status: true,
          price: true,
          bedrooms: true,
          bathrooms: true,
          _count: { select: { bookings: true, reviews: true } },
        },
        take: 15,
        orderBy: { createdAt: "desc" },
      });

      // Get owner's bookings (where they're the owner)
      const bookingsAsOwner = await prisma.booking.findMany({
        where: { ownerId: ownerId },
        include: {
          property: { select: { id: true, title: true } },
          guest: { select: { id: true, firstName: true, lastName: true } },
        },
        take: 10,
        orderBy: { createdAt: "desc" },
      });

      // Get owner's payments
      const payments = await prisma.payment.findMany({
        where: { userId: ownerId },
        include: {
          booking: { select: { id: true, property: { select: { title: true } } } },
        },
        take: 10,
        orderBy: { createdAt: "desc" },
      });

      // Get owner's reviews (for their properties)
      const reviews = await prisma.review.findMany({
        where: { property: { ownerId: ownerId } },
        include: {
          property: { select: { id: true, title: true } },
          user: { select: { id: true, firstName: true, lastName: true } },
        },
        take: 10,
        orderBy: { createdAt: "desc" },
      });

      // Transform roles
      const userRoles = ownerData.roles.map((r: any) => r.role);

      return successResponse(
        {
          user: {
            id: ownerData.id,
            email: ownerData.email,
            phone: ownerData.phone,
            firstName: ownerData.firstName,
            lastName: ownerData.lastName,
            avatar: ownerData.avatar,
            status: ownerData.status,
            roles: userRoles,
            fullName: `${ownerData.firstName} ${ownerData.lastName}`,
            birthDate: ownerData.birthDate,
            address: ownerData.address,
            city: ownerData.city,
            state: ownerData.state,
            country: ownerData.country,
            zipCode: ownerData.zipCode,
            companyName: ownerData.companyName,
            taxId: ownerData.taxId,
            website: ownerData.website,
            createdAt: ownerData.createdAt,
            updatedAt: ownerData.updatedAt,
            lastLoginAt: ownerData.lastLoginAt,
          },
          counts: ownerData._count,
          properties,
          bookingsAsOwner,
          payments,
          reviews,
        },
        "Owner details fetched successfully"
      );
    } catch (error: any) {
      console.error("Error fetching owner details:", error);
      return errorResponse(
        error.message || "Failed to fetch owner details",
        500,
        ErrorCode.INTERNAL_SERVER_ERROR
      );
    }
  },
  { roles: ["ADMIN"] }
);

export const DELETE = withAuth(
  async (request: NextRequest, user: JWTPayload) => {
    try {
      const ownerId = request.nextUrl.pathname.split("/").pop();

      if (!ownerId) {
        return errorResponse("Owner ID is required", 400, ErrorCode.VALIDATION_ERROR);
      }

      // Check if owner exists and is actually an owner
      const owner = await prisma.user.findUnique({
        where: { id: ownerId },
        include: { roles: true },
      });

      if (!owner) {
        return errorResponse("Owner not found", 404, ErrorCode.USER_NOT_FOUND);
      }

      const isOwner = owner.roles.some((r: any) => r.role === "OWNER");
      if (!isOwner) {
        return errorResponse("User is not an owner", 400, ErrorCode.VALIDATION_ERROR);
      }

      // Update status to inactive instead of hard delete
      await prisma.user.update({
        where: { id: ownerId },
        data: { status: "INACTIVE" },
      });

      return successResponse(null, "Owner deleted successfully");
    } catch (error: any) {
      console.error("Error deleting owner:", error);
      return errorResponse(
        error.message || "Failed to delete owner",
        500,
        ErrorCode.INTERNAL_SERVER_ERROR
      );
    }
  },
  { roles: ["ADMIN"] }
);

export const PATCH = withAuth(
  async (request: NextRequest, user: JWTPayload) => {
    try {
      const ownerId = request.nextUrl.pathname.split("/").pop();
      const body = await request.json();

      if (!ownerId) {
        return errorResponse("Owner ID is required", 400, ErrorCode.VALIDATION_ERROR);
      }

      // Check if owner exists
      const owner = await prisma.user.findUnique({
        where: { id: ownerId },
        include: { roles: true },
      });

      if (!owner) {
        return errorResponse("Owner not found", 404, ErrorCode.USER_NOT_FOUND);
      }

      const isOwner = owner.roles.some((r: any) => r.role === "OWNER");
      if (!isOwner) {
        return errorResponse("User is not an owner", 400, ErrorCode.VALIDATION_ERROR);
      }

      // Update owner fields
      const updatedOwner = await prisma.user.update({
        where: { id: ownerId },
        data: {
          ...(body.firstName && { firstName: body.firstName }),
          ...(body.lastName && { lastName: body.lastName }),
          ...(body.phone && { phone: body.phone }),
          ...(body.email && { email: body.email }),
          ...(body.status && { status: body.status }),
          ...(body.address && { address: body.address }),
          ...(body.city && { city: body.city }),
          ...(body.state && { state: body.state }),
          ...(body.country && { country: body.country }),
          ...(body.companyName && { companyName: body.companyName }),
          ...(body.website && { website: body.website }),
        },
      });

      return successResponse(updatedOwner, "Owner updated successfully");
    } catch (error: any) {
      console.error("Error updating owner:", error);
      return errorResponse(
        error.message || "Failed to update owner",
        500,
        ErrorCode.INTERNAL_SERVER_ERROR
      );
    }
  },
  { roles: ["ADMIN"] }
);
