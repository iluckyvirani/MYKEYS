import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/lib/response";
import { withAuth } from "@/lib/auth/middleware";
import { ErrorCode } from "@/lib/auth/errors";
import { JWTPayload } from "@/lib/auth/jwt";

/**
 * GET /api/admin/users/[id]
 * Get a specific user with all associated data
 * Roles: ADMIN only
 */
export const GET = withAuth(
  async (request: NextRequest, user: JWTPayload) => {
    try {
      const userid = request.nextUrl.pathname.split("/").pop();

      if (!userid) {
        return errorResponse("User ID is required", 400, ErrorCode.VALIDATION_ERROR);
      }

      // Get user with detailed information
      const userData = await prisma.user.findUnique({
        where: { id: userid },
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
          emergencyName: true,
          emergencyContact: true,
          companyName: true,
          taxId: true,
          website: true,
          createdAt: true,
          updatedAt: true,
          lastLoginAt: true,
          // Count relations
          _count: {
            select: {
              bookingsAsGuest: true,
              bookingsAsOwner: true,
              inquiries: true,
              reviews: true,
              payments: true,
              properties: true,
              favorites: true,
            },
          },
        },
      });

      if (!userData) {
        return errorResponse("User not found", 404, ErrorCode.USER_NOT_FOUND);
      }

      // Get user's bookings as guest (if exists)
      const bookingsAsGuest = await prisma.booking.findMany({
        where: { guestId: userid },
        include: {
          property: { select: { id: true, title: true, city: true } },
        },
        take: 10,
        orderBy: { createdAt: "desc" },
      });

      // Get user's bookings as owner (if exists)
      const bookingsAsOwner = await prisma.booking.findMany({
        where: { ownerId: userid },
        include: {
          property: { select: { id: true, title: true } },
          guest: { select: { id: true, firstName: true, lastName: true } },
        },
        take: 10,
        orderBy: { createdAt: "desc" },
      });

      // Get user's inquiries
      const inquiries = await prisma.inquiry.findMany({
        where: { userId: userid },
        include: {
          property: { select: { id: true, title: true } },
        },
        take: 10,
        orderBy: { createdAt: "desc" },
      });

      // Get user's payments
      const payments = await prisma.payment.findMany({
        where: { userId: userid },
        include: {
          booking: { select: { id: true, property: { select: { title: true } } } },
        },
        take: 10,
        orderBy: { createdAt: "desc" },
      });

      // Get user's properties (if owner)
      const properties = await prisma.property.findMany({
        where: { ownerId: userid },
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
        take: 10,
        orderBy: { createdAt: "desc" },
      });

      // Get user's reviews
      const reviews = await prisma.review.findMany({
        where: { userId: userid },
        include: {
          property: { select: { id: true, title: true } },
        },
        take: 10,
        orderBy: { createdAt: "desc" },
      });

      // Get user's favorites
      const favorites = await prisma.favorite.findMany({
        where: { userId: userid },
        include: {
          property: { select: { id: true, title: true, city: true } },
        },
        take: 10,
      });

      // Transform roles
      const userRoles = userData.roles.map((r: any) => r.role);

      return successResponse(
        {
          user: {
            id: userData.id,
            email: userData.email,
            phone: userData.phone,
            firstName: userData.firstName,
            lastName: userData.lastName,
            avatar: userData.avatar,
            status: userData.status,
            roles: userRoles,
            fullName: `${userData.firstName} ${userData.lastName}`,
            birthDate: userData.birthDate,
            address: userData.address,
            city: userData.city,
            state: userData.state,
            country: userData.country,
            zipCode: userData.zipCode,
            emergencyName: userData.emergencyName,
            emergencyContact: userData.emergencyContact,
            companyName: userData.companyName,
            taxId: userData.taxId,
            website: userData.website,
            createdAt: userData.createdAt,
            updatedAt: userData.updatedAt,
            lastLoginAt: userData.lastLoginAt,
          },
          counts: userData._count,
          bookingsAsGuest,
          bookingsAsOwner,
          inquiries,
          payments,
          properties,
          reviews,
          favorites,
        },
        "User details fetched successfully"
      );
    } catch (error: any) {
      console.error("Error fetching user details:", error);
      return errorResponse(
        error.message || "Failed to fetch user details",
        500,
        ErrorCode.INTERNAL_SERVER_ERROR
      );
    }
  },
  { roles: ["ADMIN"] }
);

/**
 * DELETE /api/admin/users/[id]
 * Delete a user account and all associated data
 * Roles: ADMIN only
 */
export const DELETE = withAuth(
  async (request: NextRequest, user: JWTPayload, context?: any) => {
    try {
      // Extract userId from URL path
      const userId = request.nextUrl.pathname.split("/").pop();

      if (!userId) {
        return errorResponse("User ID is required", 400);
      }

      // Prevent self-deletion
      if (userId === user.userId) {
        return errorResponse("You cannot delete your own account", 400);
      }

      // Check if user exists
      const userToDelete = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!userToDelete) {
        return errorResponse("User not found", 404);
      }

      // Delete user and all associated data (cascade delete is handled by Prisma)
      await prisma.user.delete({
        where: { id: userId },
      });

      return successResponse(
        { id: userId },
        "User deleted successfully"
      );
    } catch (error: any) {
      console.error("Delete user error:", error);
      if (error.code === "P2025") {
        return errorResponse("User not found", 404);
      }
      return errorResponse(
        error.message || "Failed to delete user",
        500,
        ErrorCode.INTERNAL_SERVER_ERROR
      );
    }
  },
  { roles: ["ADMIN" as any] }
);
