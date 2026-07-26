import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse, paginatedResponse } from "@/lib/response";
import { withAuth } from "@/lib/auth/middleware";
import { ErrorCode } from "@/lib/auth/errors";
import { JWTPayload } from "@/lib/auth/jwt";
import {
  getDocumentVerificationStatesForProperties,
} from "@/lib/documents/documentService";

/**
 * GET /api/admin/properties
 * Get all properties for admin dashboard with filters and pagination
 * Roles: ADMIN only
 * Query params: page, pageSize, status, propertyType, city, ownerId, minPrice, maxPrice, search, sortBy, sortOrder
 */
export const GET = withAuth(
  async (request: NextRequest, user: JWTPayload) => {
    try {
      const { searchParams } = new URL(request.url);

      // Pagination
      const page = parseInt(searchParams.get("page") || "1");
      const pageSize = parseInt(searchParams.get("pageSize") || "10");
      const skip = (page - 1) * pageSize;

      // Sorting
      const sortBy = searchParams.get("sortBy") || "createdAt";
      const sortOrder = (searchParams.get("sortOrder") || "desc") as "asc" | "desc";

      // Filters
      const status = searchParams.get("status");
      const propertyType = searchParams.get("propertyType");
      const city = searchParams.get("city");
      const ownerId = searchParams.get("ownerId");
      const minPrice = searchParams.get("minPrice");
      const maxPrice = searchParams.get("maxPrice");
      const search = searchParams.get("search");
      const listingType = searchParams.get("listingType");
      const rentalType = searchParams.get("rentalType");

      // Build where clause
      const where: any = {};

      if (status && status !== "ALL") where.status = status;
      if (propertyType && propertyType !== "ALL") where.propertyType = propertyType;
      if (listingType && listingType !== "ALL") where.listingType = listingType;
      if (rentalType && rentalType !== "ALL") where.rentalType = rentalType;
      if (city) where.city = { contains: city, mode: "insensitive" };
      if (ownerId) where.ownerId = ownerId;

      if (minPrice || maxPrice) {
        where.price = {};
        if (minPrice) where.price.gte = parseFloat(minPrice);
        if (maxPrice) where.price.lte = parseFloat(maxPrice);
      }

      if (search) {
        where.OR = [
          { title: { contains: search, mode: "insensitive" } },
          { address: { contains: search, mode: "insensitive" } },
          { city: { contains: search, mode: "insensitive" } },
          { owner: { email: { contains: search, mode: "insensitive" } } },
        ];
      }

      // Build orderBy clause
      const orderBy: any = {};
      if (sortBy === "price") {
        orderBy.price = sortOrder;
      } else if (sortBy === "title") {
        orderBy.title = sortOrder;
      } else if (sortBy === "city") {
        orderBy.city = sortOrder;
      } else if (sortBy === "rating") {
        orderBy.avgRating = sortOrder;
      } else {
        orderBy.createdAt = sortOrder;
      }

      // Get properties with pagination
      const [properties, total] = await Promise.all([
        prisma.property.findMany({
          where,
          skip,
          take: pageSize,
          orderBy,
          include: {
            owner: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
            images: {
              select: {
                id: true,
                url: true,
                isPrimary: true,
              },
              take: 1,
            },
            _count: {
              select: {
                reviews: true,
                bookings: true,
              },
            },
          },
        }),
        prisma.property.count({ where }),
      ]);

      const verificationByProperty = await getDocumentVerificationStatesForProperties(
        properties.map((p) => ({
          id: p.id,
          listingType: p.listingType,
          rentalType: p.rentalType,
        }))
      );

      // Transform data to DTO format
      const propertyDTOs = properties.map((p: any) => {
        const docVerification = verificationByProperty.get(p.id);
        const documentsVerified = docVerification?.allVerified ?? true;
        const documentsPendingVerification =
          Boolean(docVerification?.hasRequiredDocuments) && !documentsVerified;

        const fullData = {
          id: p.id,
          title: p.title,
          slug: p.slug,
          description: p.description,
          address: p.address,
          city: p.city,
          state: p.state,
          country: p.country,
          zipCode: p.zipCode,
          latitude: p.latitude,
          longitude: p.longitude,
          propertyType: p.propertyType,
          listingType: p.listingType,
          rentalType: p.rentalType,
          price: p.price,
          priceType: p.priceType,
          propertyPrice: p.propertyPrice,
          originalPrice: p.originalPrice,
          cleaningFee: p.cleaningFee,
          serviceFee: p.serviceFee,
          securityDeposit: p.securityDeposit,
          bedrooms: p.bedrooms,
          bathrooms: p.bathrooms,
          sqft: p.sqft,
          guests: p.guests,
          minStay: p.minStay,
          maxStay: p.maxStay,
          minTerm: p.minTerm,
          maxTerm: p.maxTerm,
          status: p.status,
          isFeatured: p.isFeatured,
          isVerified: p.isVerified,
          ownerId: p.ownerId,
          createdAt: p.createdAt,
          updatedAt: p.updatedAt,
          images: p.images,
          reviewsCount: p._count.reviews,
          bookingsCount: p._count.bookings,
        };

        return {
          id: p.id,
          title: p.title,
          address: p.address,
          city: p.city,
          state: p.state,
          zipCode: p.zipCode,
          propertyType: p.propertyType,
          listingType: p.listingType,
          rentalType: p.rentalType,
          priceType: p.priceType,
          price: p.price,
          propertyPrice: p.propertyPrice,
          bedrooms: p.bedrooms,
          bathrooms: p.bathrooms,
          sqft: p.sqft,
          guests: p.guests,
          description: p.description,
          ownerId: p.ownerId,
          ownerName: `${p.owner?.firstName || ""} ${p.owner?.lastName || ""}`.trim(),
          ownerEmail: p.owner?.email,
          images: p.images,
          avgRating: p.avgRating || 0,
          reviewsCount: p._count.reviews,
          bookingsCount: p._count.bookings,
          status: p.status,
          documentsVerified,
          documentsPendingVerification,
          documentVerification: docVerification
            ? {
                pendingReview: docVerification.pendingReview,
                missingUpload: docVerification.missingUpload,
                hasRejected: docVerification.hasRejected,
              }
            : null,
          createdAt: p.createdAt,
          updatedAt: p.updatedAt,
          fullData,
        };
      });

      return paginatedResponse(
        propertyDTOs,
        total,
        page,
        pageSize,
        "Properties retrieved successfully"
      );
    } catch (error) {
      console.error("Get admin properties error:", error);
      return errorResponse(
        "Failed to retrieve properties",
        500,
        ErrorCode.INTERNAL_SERVER_ERROR
      );
    }
  },
  { roles: ["ADMIN" as any] }
);

/**
 * PATCH /api/admin/properties
 * Update property status or details
 * Body: { propertyId: string, status?: string, notes?: string }
 * Roles: ADMIN only
 */
export const PATCH = withAuth(
  async (request: NextRequest, user: JWTPayload) => {
    try {
      const { propertyId, status, notes } = await request.json();

      if (!propertyId) {
        return errorResponse("propertyId is required", 400);
      }

      const updateData: any = {};
      if (status) updateData.status = status;
      if (notes) updateData.adminNotes = notes;

      if (Object.keys(updateData).length === 0) {
        return errorResponse("At least one field to update is required", 400);
      }

      const validStatuses = [
        "DRAFT",
        "PENDING_REVIEW",
        "ACTIVE",
        "INACTIVE",
        "SOLD",
        "RENTED",
        "MAINTENANCE",
      ];

      if (status && !validStatuses.includes(status)) {
        return errorResponse(
          `Invalid status. Must be one of: ${validStatuses.join(", ")}`,
          400
        );
      }

      const updatedProperty = await prisma.property.update({
        where: { id: propertyId },
        data: updateData,
        include: {
          owner: { select: { firstName: true, lastName: true, email: true } },
        },
      });

      return successResponse(
        updatedProperty,
        "Property updated successfully"
      );
    } catch (error: any) {
      console.error("Update property error:", error);
      if (error.code === "P2025") {
        return errorResponse("Property not found", 404);
      }
      return errorResponse(
        error.message || "Failed to update property",
        500,
        ErrorCode.INTERNAL_SERVER_ERROR
      );
    }
  },
  { roles: ["ADMIN" as any] }
);

/**
 * POST /api/admin/properties
 * Create a property on behalf of an owner (must have fullAdminSupport package)
 * or as admin's own listing when no ownerId is provided.
 * Body: { ownerId?, title, address, city, state, country, zipCode, latitude, longitude,
 *         propertyType, listingType, rentalType?, price, priceType, ... images[] }
 * Roles: ADMIN only
 */
export const POST = withAuth(
  async (request: NextRequest, user: JWTPayload) => {
    try {
      const body = await request.json();
      const { ownerId, ...propertyData } = body;

      // --- Determine who owns the listing ---
      let effectiveOwnerId: string;

      if (ownerId) {
        // Verify this owner has an active fullAdminSupport package
        const ownerPkg = await prisma.ownerPackage.findFirst({
          where: {
            ownerId,
            status: "ACTIVE",
            package: { fullAdminSupport: true },
          },
          select: { id: true },
        });

        if (!ownerPkg) {
          return errorResponse(
            "Selected owner does not have an active Full Admin Support package",
            400,
            ErrorCode.VALIDATION_ERROR
          );
        }
        effectiveOwnerId = ownerId;
      } else {
        // Admin creates the property under their own account
        effectiveOwnerId = (user as any).id;
      }

      // --- Validate required fields ---
      const { title, address, propertyType, listingType, price } = propertyData;
      if (!title || !address || !propertyType || !listingType || !price) {
        return errorResponse(
          "title, address, propertyType, listingType, and price are required",
          400,
          ErrorCode.VALIDATION_ERROR
        );
      }

      // --- Build images payload ---
      const images: { url: string; isPrimary: boolean }[] = Array.isArray(propertyData.images)
        ? propertyData.images
        : [];

      // --- Create property ---
      const slug =
        propertyData.title.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "") +
        "-" +
        Date.now();

      const property = await prisma.property.create({
        data: {
          ownerId: effectiveOwnerId,
          slug,
          title: propertyData.title,
          description: propertyData.description || "",
          address: propertyData.address,
          city: propertyData.city || "",
          state: propertyData.state || "",
          country: propertyData.country || "United Kingdom",
          zipCode: propertyData.zipCode || undefined,
          latitude: propertyData.latitude ? parseFloat(propertyData.latitude) : undefined,
          longitude: propertyData.longitude ? parseFloat(propertyData.longitude) : undefined,
          propertyType: propertyData.propertyType,
          listingType: propertyData.listingType,
          rentalType: propertyData.rentalType || undefined,
          price: parseFloat(propertyData.price),
          priceType: propertyData.priceType || "NIGHTLY",
          bedrooms: propertyData.bedrooms ? parseInt(propertyData.bedrooms) : 0,
          bathrooms: propertyData.bathrooms ? parseInt(propertyData.bathrooms) : 0,
          sqft: propertyData.sqft ? parseInt(propertyData.sqft) : undefined,
          guests: propertyData.guests ? parseInt(propertyData.guests) : 2,
          status: "DRAFT",
          amenities: Array.isArray(propertyData.amenities) ? propertyData.amenities : [],
          // Rent-specific
          securityDeposit: propertyData.securityDeposit ? parseFloat(propertyData.securityDeposit) : undefined,
          cleaningFee: propertyData.cleaningFee ? parseFloat(propertyData.cleaningFee) : undefined,
          serviceFee: propertyData.serviceFee ? parseFloat(propertyData.serviceFee) : undefined,
          minStay: propertyData.minStay ? parseInt(propertyData.minStay) : undefined,
          maxStay: propertyData.maxStay ? parseInt(propertyData.maxStay) : undefined,
          checkInTime: propertyData.checkInTime || undefined,
          checkOutTime: propertyData.checkOutTime || undefined,
          selfCheckIn: propertyData.selfCheckIn ?? false,
          parking: propertyData.parking ?? false,
          availableFrom: propertyData.availableFrom
            ? new Date(propertyData.availableFrom)
            : undefined,
          minTerm: propertyData.minTerm ? parseInt(propertyData.minTerm) : undefined,
          maxTerm: propertyData.maxTerm ? parseInt(propertyData.maxTerm) : undefined,
          billsIncluded: propertyData.billsIncluded ?? undefined,
          occupancyType:
            propertyData.rentalType === "LONG_TERM"
              ? propertyData.occupancyType === "ROOM"
                ? "ROOM"
                : "WHOLE_PROPERTY"
              : undefined,
          councilTaxBand: propertyData.councilTaxBand || undefined,
          epcRating: propertyData.epcRating || undefined,
          epcCurrentScore: propertyData.epcCurrentScore
            ? parseInt(propertyData.epcCurrentScore, 10)
            : undefined,
          epcPotentialScore: propertyData.epcPotentialScore
            ? parseInt(propertyData.epcPotentialScore, 10)
            : undefined,
          furnishType: propertyData.furnishType || undefined,
          garden: propertyData.garden || undefined,
          parkingType: propertyData.parkingType || undefined,
          accessibility: propertyData.accessibility || undefined,
          keyFeatures: Array.isArray(propertyData.keyFeatures)
            ? propertyData.keyFeatures
            : [],
          utilities: propertyData.utilities || undefined,
          broadbandSpeed: propertyData.broadbandSpeed || undefined,
          floodRisk: propertyData.floodRisk || undefined,
          // Buy-specific
          propertyPrice: propertyData.propertyPrice ? parseFloat(propertyData.propertyPrice) : undefined,
          yearBuilt: propertyData.yearBuilt ? parseInt(propertyData.yearBuilt) : undefined,
          images: images.length
            ? { create: images.map((img, i) => ({ url: img.url, isPrimary: i === 0 })) }
            : undefined,
        },
        include: {
          images: { select: { id: true, url: true, isPrimary: true } },
          owner: { select: { id: true, firstName: true, lastName: true, email: true } },
        },
      });

      return successResponse(property, "Property created successfully");
    } catch (error: any) {
      console.error("Admin create property error:", error);
      return errorResponse(
        error.message || "Failed to create property",
        500,
        ErrorCode.INTERNAL_SERVER_ERROR
      );
    }
  },
  { roles: ["ADMIN" as any] }
);
