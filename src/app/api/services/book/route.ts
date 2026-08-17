import { NextRequest } from "next/server";
import { successResponse, errorResponse } from "@/lib/response";
import { prisma } from "@/lib/prisma";
import { verifyAccessToken } from "@/lib/auth/jwt";
import { serviceService } from "@/lib/services/serviceService";
import { catalogService, splitCatalogPrice } from "@/lib/services/catalogService";
import { readStripePublishableKey } from "@/lib/stripe-config";
import { STRIPE_MIN_AMOUNT_GBP } from "@/lib/stripe";

/**
 * POST /api/services/book
 * Book a catalog service with a ranked provider. Creates Stripe PaymentIntent to MYKEYS.
 * Body: { catalogServiceId, providerId, description?, scheduledDate?, scheduledTime?, location? }
 */
export async function POST(request: NextRequest) {
  try {
    const token =
      request.headers.get("authorization")?.replace("Bearer ", "") ||
      request.cookies.get("accessToken")?.value;

    if (!token) return errorResponse("Authentication required", 401);
    const payload = await verifyAccessToken(token);
    if (!payload) return errorResponse("Invalid or expired token", 401);

    const body = await request.json();
    const {
      catalogServiceId,
      providerId,
      description,
      scheduledDate,
      scheduledTime,
      location,
    } = body;

    if (!catalogServiceId || !providerId) {
      return errorResponse("catalogServiceId and providerId are required", 400);
    }

    const catalog = await catalogService.getById(catalogServiceId);
    if (!catalog || !catalog.isActive) {
      return errorResponse("Service not available", 404);
    }

    const offer = await prisma.providerOfferedService.findUnique({
      where: {
        providerId_catalogServiceId: { providerId, catalogServiceId },
      },
    });
    if (!offer) {
      return errorResponse("This provider does not offer that service", 400);
    }

    const provider = await prisma.serviceProvider.findUnique({
      where: { id: providerId },
    });
    if (!provider || !provider.isActive) {
      return errorResponse("Service provider not found", 404);
    }

    const price = catalog.price;
    if (price > 0 && price < STRIPE_MIN_AMOUNT_GBP) {
      return errorResponse(
        `Service price must be at least £${STRIPE_MIN_AMOUNT_GBP.toFixed(2)} for card payment`,
        400
      );
    }

    const { commissionAmount, providerEarnings } = splitCatalogPrice(
      price,
      catalog.commissionPercent
    );

    let stripeClientSecret: string | null = null;
    let stripePaymentIntentId: string | null = null;

    if (price > 0) {
      try {
        const { stripe, toPence } = await import("@/lib/stripe");
        const { withStripeCustomerForPayment } = await import("@/lib/stripe/customer");
        const intent = await stripe.paymentIntents.create(
          await withStripeCustomerForPayment(payload.userId, {
            amount: toPence(price),
            currency: "gbp",
            automatic_payment_methods: { enabled: true },
            metadata: {
              type: "service_booking",
              catalogServiceId,
              providerId,
              clientId: payload.userId,
            },
          })
        );
        stripeClientSecret = intent.client_secret;
        stripePaymentIntentId = intent.id;
      } catch (err) {
        console.error("Stripe intent for service booking failed:", err);
      }
    }

    const booking = await serviceService.createBooking({
      clientId: payload.userId,
      providerId,
      catalogServiceId,
      service: catalog.name,
      category: catalog.categoryId,
      bookingType: "SCHEDULED",
      description,
      scheduledDate: scheduledDate ? new Date(scheduledDate) : undefined,
      scheduledTime,
      location,
      totalAmount: price,
      price,
      commissionPercent: catalog.commissionPercent,
      commissionAmount,
      providerEarnings,
      stripePaymentIntentId: stripePaymentIntentId || undefined,
    });

    // Free services: mark paid immediately
    if (price === 0) {
      await serviceService.markBookingPaid(booking.id, payload.userId);
    }

    let publishableKey = "";
    try {
      publishableKey = readStripePublishableKey();
    } catch {
      // optional
    }

    return successResponse(
      {
        booking,
        clientSecret: stripeClientSecret,
        publishableKey,
        amount: price,
      },
      "Booking created",
      201
    );
  } catch (error: any) {
    console.error("Booking creation error:", error);
    return errorResponse(error.message || "Failed to create booking", 500);
  }
}
