import { NextRequest } from "next/server";
import { catalogService } from "@/lib/services/catalogService";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/lib/response";
import { loadServiceCheckoutFees } from "@/lib/services/loadServiceCheckoutFees";

/**
 * GET /api/services/marketplace
 * ?categoryId=&catalogServiceId=
 * Browse catalog + ranked providers for booking.
 */
export async function GET(request: NextRequest) {
  try {
    const catalogServiceId = request.nextUrl.searchParams.get("catalogServiceId");

    const [categories, catalog, checkoutFees] = await Promise.all([
      prisma.serviceCategoryInfo.findMany({
        where: { status: "active" },
        orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      }),
      catalogService.list({ activeOnly: true }),
      loadServiceCheckoutFees(),
    ]);

    const categoriesWithCounts = categories.map((c) => ({
      ...c,
      serviceCount: catalog.filter((s) => s.categoryId === c.id).length,
    }));

    let providers: any[] = [];
    let selectedService = null as any;

    if (catalogServiceId) {
      selectedService = await catalogService.getById(catalogServiceId);
      const ranked = await catalogService.rankedProvidersForService(catalogServiceId);
      // If none verified yet, still show active providers who offer it
      if (ranked.length === 0) {
        const offers = await prisma.providerOfferedService.findMany({
          where: {
            catalogServiceId,
            provider: { isActive: true },
          },
          include: {
            provider: {
              include: {
                user: {
                  select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    avatar: true,
                  },
                },
              },
            },
          },
        });
        providers = offers
          .map((o) => o.provider)
          .sort((a, b) => b.rating - a.rating || b.totalReviews - a.totalReviews);
      } else {
        providers = ranked;
      }
    }

    return successResponse(
      {
        categories: categoriesWithCounts,
        catalog,
        selectedService,
        providers: providers.map((p) => ({
          id: p.id,
          bio: p.bio,
          rating: p.rating,
          totalReviews: p.totalReviews,
          completedBookings: p.completedBookings,
          serviceAreas: p.serviceAreas,
          documentVerified: p.documentVerified,
          user: p.user,
        })),
        checkoutFees,
      },
      "Marketplace data"
    );
  } catch (err: any) {
    console.error("Marketplace error:", err);
    return errorResponse(err.message || "Failed", 500);
  }
}
