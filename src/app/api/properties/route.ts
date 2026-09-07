import { NextRequest } from "next/server";
import { isDatabaseConnectionError, prisma } from "@/lib/prisma";
import { successResponse, errorResponse, paginatedResponse } from "@/lib/response";
import { withAuth } from "@/lib/auth/middleware";
import { ErrorCode } from "@/lib/auth/errors";
import { JWTPayload } from "@/lib/auth/jwt";
import { getBoostedPropertyIds, getAdminSettings } from "@/lib/bids/bidService";
import { getDocumentVerificationStatesForProperties } from "@/lib/documents/documentService";
import { maybeNotifyNewListing } from "@/lib/newsletter/service";
import {
  compactUkPostcode,
  formatUkPostcode,
  isLikelyUkPostcode,
  ukOutwardCode,
} from "@/lib/ukPostcode";

/**
 * GET /api/properties
 * Get all properties with optional filters and pagination
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Pagination
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = parseInt(searchParams.get("pageSize") || "10");
    const skip = (page - 1) * pageSize;

    // Filters
    const forOwner = searchParams.get("forOwner") === "true";
    const ownerId = searchParams.get("ownerId");
    const search = searchParams.get("search");
    const status = searchParams.get("status");
    const listingType = searchParams.get("listingType");
    const propertyType = searchParams.get("propertyType");
    const city = searchParams.get("city");
    const state = searchParams.get("state");
    const zipCode = searchParams.get("zipCode");
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");
    const bedrooms = searchParams.get("bedrooms");
    const maxBedrooms = searchParams.get("maxBedrooms");
    const bathrooms = searchParams.get("bathrooms");
    const rentalType = searchParams.get("rentalType");
    const occupancyType = searchParams.get("occupancyType");
    const minRating = searchParams.get("minRating");
    const guests = searchParams.get("guests");
    const minStay = searchParams.get("minStay");
    const maxStay = searchParams.get("maxStay");
    const minTerm = searchParams.get("minTerm");
    const maxTerm = searchParams.get("maxTerm");
    const addedWithinDays = searchParams.get("addedWithinDays");
    const radiusMiles = parseFloat(searchParams.get("radiusMiles") || "0");
    let searchLat = parseFloat(searchParams.get("lat") || "");
    let searchLng = parseFloat(searchParams.get("lng") || "");
    const wantsRadius = Number.isFinite(radiusMiles) && radiusMiles > 0;

    // Build where clause
    const where: any = {};

    // Owner filters
    if (forOwner) {
      // Note: forOwner requires authentication in middleware, use context to get userId
      // For now, this will need userId from the authenticated request
      // This will be set in withAuth wrapper for owner dashboard
    }
    if (ownerId) where.ownerId = ownerId;

    // Search by title or address
    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { address: { contains: search, mode: "insensitive" } },
        { city: { contains: search, mode: "insensitive" } },
      ];
    }

    if (status) {
      const statuses = status.split(",").map((s: string) => s.trim()).filter(Boolean);
      where.status = statuses.length === 1 ? statuses[0] : { in: statuses };
    }
    if (listingType) where.listingType = listingType;
    if (rentalType) where.rentalType = rentalType;
    if (propertyType) {
      const types = propertyType
        .split(",")
        .map((t: string) => t.trim())
        .filter(Boolean)
        // Legacy UI value; schema uses APARTMENT
        .map((t: string) => (t === "FLAT" ? "APARTMENT" : t));
      const unique = [...new Set(types)];
      where.propertyType = unique.length === 1 ? unique[0] : { in: unique };
    }

    // Resolve search origin for radius (coords param or Nominatim geocode)
    if (
      wantsRadius &&
      (!Number.isFinite(searchLat) || !Number.isFinite(searchLng))
    ) {
      const geoQuery = [zipCode, city].filter(Boolean).join(", ") || null;
      if (geoQuery) {
        try {
          const geoUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
            `${geoQuery}, UK`
          )}&countrycodes=gb&limit=1`;
          const geoRes = await fetch(geoUrl, {
            headers: {
              Accept: "application/json",
              "User-Agent": "MYKEYS-PropertySearch/1.0",
            },
            next: { revalidate: 86400 },
          });
          if (geoRes.ok) {
            const geoJson = await geoRes.json();
            if (Array.isArray(geoJson) && geoJson[0]) {
              searchLat = parseFloat(geoJson[0].lat);
              searchLng = parseFloat(geoJson[0].lon);
            }
          }
        } catch (e) {
          console.warn("Geocode for radius failed:", e);
        }
      }
    }

    const useGeoRadius =
      wantsRadius && Number.isFinite(searchLat) && Number.isFinite(searchLng);

    // UK outward-code widen when radius requested but geocode unavailable
    const outwardFromZip = (value: string) => ukOutwardCode(value);

    if (useGeoRadius) {
      where.latitude = { not: null };
      where.longitude = { not: null };
    } else {
      if (city) where.city = { contains: city, mode: "insensitive" };
      if (zipCode) {
        const formatted = isLikelyUkPostcode(zipCode)
          ? formatUkPostcode(zipCode)
          : zipCode.trim();
        const compact = compactUkPostcode(formatted);
        const outward = outwardFromZip(formatted);
        const zipFilter = wantsRadius ? outward : formatted;

        // Match formatted (E14 9RZ), compact (E149RZ), and outward (E14)
        // so owner/user spacing & case differences still find listings
        where.AND = [
          ...((where.AND as object[]) || []),
          {
            OR: [
              { zipCode: { contains: zipFilter, mode: "insensitive" } },
              ...(compact !== zipFilter
                ? [{ zipCode: { contains: compact, mode: "insensitive" } }]
                : []),
              ...(outward !== zipFilter && outward !== compact
                ? [{ zipCode: { contains: outward, mode: "insensitive" } }]
                : []),
            ],
          },
        ];
      }
    }
    if (state) where.state = { contains: state, mode: "insensitive" };
    
    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = parseFloat(minPrice);
      if (maxPrice) where.price.lte = parseFloat(maxPrice);
    }

    if (bedrooms || maxBedrooms) {
      where.bedrooms = {};
      if (bedrooms) where.bedrooms.gte = parseInt(bedrooms);
      if (maxBedrooms) where.bedrooms.lte = parseInt(maxBedrooms);
    }
    if (bathrooms) where.bathrooms = { gte: parseInt(bathrooms) };

    if (addedWithinDays) {
      const days = parseInt(addedWithinDays, 10);
      if (Number.isFinite(days) && days > 0) {
        const since = new Date();
        since.setDate(since.getDate() - days);
        where.createdAt = { gte: since };
      }
    }

    // Short-term rental filters
    if (rentalType === "SHORT_TERM") {
      if (guests) where.guests = { gte: parseInt(guests) };
      if (minStay) where.minStay = { gte: parseInt(minStay) };
      if (maxStay) where.maxStay = { lte: parseInt(maxStay) };
    }

    // Long-term rental filters
    if (rentalType === "LONG_TERM") {
      if (minTerm) where.minTerm = { gte: parseInt(minTerm) };
      if (maxTerm) where.maxTerm = { lte: parseInt(maxTerm) };

      // Only apply when the generated client knows this field (avoids 500 on stale Turbopack cache)
      const occupancySupported = (() => {
        try {
          // eslint-disable-next-line @typescript-eslint/no-require-imports
          const { Prisma } = require("@prisma/client");
          return !!Prisma.dmmf?.datamodel?.models
            ?.find((m: { name: string }) => m.name === "Property")
            ?.fields?.some((f: { name: string }) => f.name === "occupancyType");
        } catch {
          return false;
        }
      })();

      if (occupancySupported) {
        if (occupancyType === "ROOM") {
          where.occupancyType = "ROOM";
        } else if (occupancyType === "WHOLE_PROPERTY") {
          where.NOT = { occupancyType: "ROOM" };
        }
      }
    }

    // Minimum rating filter
    if (minRating) {
      where.reviews = {
        some: {
          rating: { gte: parseInt(minRating) },
        },
      };
    }

    // Get properties with pagination
    const include = {
      owner: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
          companyName: true,
          avatar: true,
          city: true,
          listingSellerType: true,
          agentLogo: true,
        },
      },
      images: true,
      amenities: {
        include: {
          amenity: true,
        },
      },
      reviews: {
        select: {
          rating: true,
        },
      },
    };

    const milesBetween = (
      lat1: number,
      lon1: number,
      lat2: number,
      lon2: number
    ) => {
      const toRad = (d: number) => (d * Math.PI) / 180;
      const R = 3958.8;
      const dLat = toRad(lat2 - lat1);
      const dLon = toRad(lon2 - lon1);
      const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(toRad(lat1)) *
          Math.cos(toRad(lat2)) *
          Math.sin(dLon / 2) ** 2;
      return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    };

    let properties: any[];
    let total: number;

    if (useGeoRadius) {
      const candidates = await prisma.property.findMany({
        where,
        take: 500,
        include,
        orderBy: { createdAt: "desc" },
      });
      const withinRadius = candidates.filter((p) => {
        if (typeof p.latitude !== "number" || typeof p.longitude !== "number") {
          return false;
        }
        return (
          milesBetween(searchLat, searchLng, p.latitude, p.longitude) <=
          radiusMiles
        );
      });
      total = withinRadius.length;
      properties = withinRadius.slice(skip, skip + pageSize);
    } else {
      const [items, count] = await Promise.all([
        prisma.property.findMany({
          where,
          skip,
          take: pageSize,
          include,
          orderBy: { createdAt: "desc" },
        }),
        prisma.property.count({ where }),
      ]);
      properties = items;
      total = count;
    }

    const verificationByProperty = await getDocumentVerificationStatesForProperties(
      properties.map((p) => ({
        id: p.id,
        listingType: p.listingType,
        rentalType: p.rentalType,
      }))
    );

    const publiclyVisible = properties.filter((property) => {
      if (property.status === "ACTIVE") {
        const docState = verificationByProperty.get(property.id);
        if (docState?.hasRejected) return false;
        return true;
      }
      return true;
    });

    const visibleTotal = publiclyVisible.length;

    // Calculate average rating for each property
    const propertiesWithRating = publiclyVisible.map((property: any) => {
      const avgRating =
        property.reviews.length > 0
          ? property.reviews.reduce((sum: number, r: any) => sum + r.rating, 0) /
            property.reviews.length
          : 0;

      return {
        ...property,
        averageRating: Math.round(avgRating * 10) / 10,
        reviewCount: property.reviews.length,
        isBoosted: false, // overridden below for short rent zip searches
      };
    });

    // ── Boosted sort for SHORT_TERM + zipCode searches ───────────────────────
    // Move boosted properties to the top when user is browsing a specific zip code
    if (zipCode && rentalType === "SHORT_TERM") {
      const settings = await getAdminSettings();
      const boostedIds = await getBoostedPropertyIds(
        zipCode,
        settings.maxBoostedSlotsPerZip
      );
      if (boostedIds.length > 0) {
        const boostedSet = new Set(boostedIds);
        // Mark boosted flag
        propertiesWithRating.forEach((p: any) => {
          if (boostedSet.has(p.id)) p.isBoosted = true;
        });
        // Sort: boosted first (preserve bid order), then the rest
        const boostedOrder = new Map(boostedIds.map((id, idx) => [id, idx]));
        propertiesWithRating.sort((a: any, b: any) => {
          const aIdx = boostedOrder.has(a.id) ? boostedOrder.get(a.id)! : Infinity;
          const bIdx = boostedOrder.has(b.id) ? boostedOrder.get(b.id)! : Infinity;
          return aIdx - bIdx;
        });
      }
    }

    return paginatedResponse(
      propertiesWithRating,
      visibleTotal,
      page,
      pageSize,
      "Properties retrieved successfully"
    );
  } catch (error: any) {
    if (isDatabaseConnectionError(error)) {
      console.warn("[properties] Database unreachable — returning empty list");
      const { searchParams } = new URL(request.url);
      const page = parseInt(searchParams.get("page") || "1");
      const pageSize = parseInt(searchParams.get("pageSize") || "10");
      return paginatedResponse(
        [],
        0,
        page,
        pageSize,
        "Properties temporarily unavailable"
      );
    }
    console.error("Get properties error:", error);
    const detail =
      process.env.NODE_ENV === "development"
        ? error?.message || "Failed to retrieve properties"
        : "Failed to retrieve properties";
    return errorResponse(detail, 500, ErrorCode.INTERNAL_SERVER_ERROR);
  }
}

/**
 * POST /api/properties
 * Create a new property (Owner/Admin only)
 */
export const POST = withAuth(
  async (request: NextRequest, user: JWTPayload) => {
    try {
      const body = await request.json();

      // Validate required fields
      const {
        title,
        description,
        address,
        city,
        state,
        country,
        zipCode,
        price,
        priceType,
        propertyType,
        listingType,
        bedrooms,
        bathrooms,
        amenities,
        images,
      } = body;

      if (
        !title ||
        !address ||
        !city ||
        !state ||
        price === undefined ||
        price === null ||
        !priceType ||
        !propertyType ||
        !listingType
      ) {
        return errorResponse(
          "Missing required fields: title, address, city, state, price, priceType, propertyType, listingType",
          400,
          ErrorCode.VALIDATION_ERROR
        );
      }

      // Validate amenities exist if provided
      if (amenities && amenities.length > 0) {
        const existingAmenities = await prisma.amenity.findMany({
          where: {
            id: {
              in: amenities,
            },
          },
          select: { id: true },
        });

        if (existingAmenities.length !== amenities.length) {
          return errorResponse(
            "One or more amenities do not exist",
            400,
            ErrorCode.VALIDATION_ERROR
          );
        }
      }

      // Create property
      const property = await prisma.property.create({
        data: {
          title,
          slug: title.toLowerCase().replace(/\s+/g, "-") + "-" + Date.now(),
          description,
          address,
          city,
          state,
          country: country || "India",
          zipCode: zipCode
            ? isLikelyUkPostcode(zipCode)
              ? formatUkPostcode(zipCode)
              : String(zipCode).trim()
            : zipCode,
          latitude: body.latitude,
          longitude: body.longitude,
          price,
          priceType,
          originalPrice: body.originalPrice,
          cleaningFee: body.cleaningFee || 0,
          serviceFee: body.serviceFee || 0,
          securityDeposit: body.securityDeposit || 0,
          propertyType,
          listingType,
          rentalType: body.rentalType,
          bedrooms: bedrooms || 1,
          bathrooms: bathrooms || 1,
          sqft: body.sqft,
          guests: body.guests || 2,
          minStay: body.minStay || 1,
          maxStay: body.maxStay,
          yearBuilt: body.yearBuilt,
          checkInTime: body.checkInTime || "14:00",
          checkOutTime: body.checkOutTime || "11:00",
          selfCheckIn: body.selfCheckIn || false,
          parking: body.parking || false,
          status: body.status || "DRAFT",
          isFeatured: body.isFeatured || false,
          // Long rent specific
          availableFrom: body.availableFrom,
          minTerm: body.minTerm || 1,
          maxTerm: body.maxTerm,
          billsIncluded: body.billsIncluded,
          occupancyType:
            body.rentalType === "LONG_TERM"
              ? body.occupancyType === "ROOM"
                ? "ROOM"
                : "WHOLE_PROPERTY"
              : null,
          councilTaxBand: body.councilTaxBand,
          epcRating: body.epcRating,
          epcCurrentScore: body.epcCurrentScore != null ? parseInt(body.epcCurrentScore, 10) : undefined,
          epcPotentialScore: body.epcPotentialScore != null ? parseInt(body.epcPotentialScore, 10) : undefined,
          furnishType: body.furnishType || null,
          garden: body.garden || null,
          parkingType: body.parkingType || null,
          accessibility: body.accessibility || null,
          keyFeatures: Array.isArray(body.keyFeatures)
            ? body.keyFeatures.filter((f: string) => String(f).trim())
            : [],
          utilities: body.utilities || undefined,
          broadbandSpeed: body.broadbandSpeed || null,
          floodRisk: body.floodRisk || null,
          // Sale specific
          propertyPrice: body.propertyPrice,
          propertyTax: body.propertyTax,
          hoaFee: body.hoaFee,
          leasehold: body.leasehold,
          leaseYears: body.leaseYears,
          groundRent: body.groundRent,
          ownerId: user.userId,
          // Create images if provided
          ...(images && images.length > 0 && {
            images: {
              create: images.map((img: any, index: number) => ({
                url: img.url,
                caption: img.caption || null,
                isPrimary: index === 0,
              })),
            },
          }),
          // Connect amenities if provided
          ...(amenities && amenities.length > 0 && {
            amenities: {
              create: amenities.map((amenityId: string) => ({
                amenityId,
              })),
            },
          }),
        },
        include: {
          images: true,
          amenities: {
            include: {
              amenity: true,
            },
          },
        },
      });

      maybeNotifyNewListing({
        previousStatus: null,
        nextStatus: property.status,
        propertyId: property.id,
      });

      return successResponse(property, "Property created successfully", 201);
    } catch (error) {
      console.error("Create property error:", error);
      return errorResponse(
        "Failed to create property",
        500,
        ErrorCode.INTERNAL_SERVER_ERROR
      );
    }
  },
  { roles: ["OWNER", "AGENT", "ADMIN"] }
);
