import { NextRequest } from "next/server";
import { successResponse, errorResponse } from "@/lib/response";
import { prisma } from "@/lib/prisma";
import { verifyAccessToken } from "@/lib/auth/jwt";
import { serviceService } from "@/lib/services/serviceService";
import { catalogService, splitCatalogPrice } from "@/lib/services/catalogService";
import {
  computeServicePaymentSummary,
  getSlotSurcharge,
  parseSlotPeriod,
} from "@/lib/services/serviceCheckoutFees";
import { loadServiceCheckoutFees } from "@/lib/services/loadServiceCheckoutFees";
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
      bookingType,
      slotPeriod: slotPeriodRaw,
      tipAmount: tipAmountRaw,
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
    const slotPeriod = parseSlotPeriod(slotPeriodRaw);
    const slotSurcharge = getSlotSurcharge(catalog, slotPeriod);
    const tipAmount = Math.max(0, parseFloat(Number(tipAmountRaw || 0).toFixed(2)));
    const fees = await loadServiceCheckoutFees();
    const summary = computeServicePaymentSummary(price, fees, {
      basePrice: price,
      slotSurcharge,
      slotPeriod,
      tip: tipAmount,
    });
    const amountToPay = summary.amountToPay;
    const commissionBase = summary.itemTotal;

    if (amountToPay > 0 && amountToPay < STRIPE_MIN_AMOUNT_GBP) {
      return errorResponse(
        `Amount to pay must be at least £${STRIPE_MIN_AMOUNT_GBP.toFixed(2)} for card payment`,
        400
      );
    }

    const { commissionAmount, providerEarnings: splitEarnings } = splitCatalogPrice(
      commissionBase,
      catalog.commissionPercent
    );
    const providerEarnings = parseFloat((splitEarnings + tipAmount).toFixed(2));

    let stripeClientSecret: string | null = null;
    let stripePaymentIntentId: string | null = null;

    if (amountToPay > 0) {
      try {
        const { stripe, toPence } = await import("@/lib/stripe");
        const { withStripeCustomerForPayment } = await import("@/lib/stripe/customer");
        const intent = await stripe.paymentIntents.create(
          await withStripeCustomerForPayment(
            payload.userId,
            {
              amount: toPence(amountToPay),
              currency: "gbp",
              payment_method_types: ["card"],
              metadata: {
                type: "service_booking",
                catalogServiceId,
                providerId,
                clientId: payload.userId,
                itemTotal: String(summary.itemTotal),
                taxesAndFee: String(summary.taxesAndFee),
                slotPeriod: slotPeriod || "",
                slotSurcharge: String(slotSurcharge),
                tipAmount: String(tipAmount),
              },
            },
            { saveForFuture: false }
          )
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
      bookingType: bookingType === "instant" ? "instant" : "scheduled",
      description: [
        description,
        slotPeriod
          ? `Slot: ${slotPeriod}${scheduledTime ? ` ${scheduledTime}` : ""} (+£${slotSurcharge.toFixed(2)})`
          : "",
        tipAmount > 0 ? `Tip for professional: £${tipAmount.toFixed(2)}` : "",
      ]
        .filter(Boolean)
        .join("\n"),
      scheduledDate: scheduledDate ? new Date(scheduledDate) : undefined,
      scheduledTime,
      location,
      totalAmount: amountToPay,
      price: commissionBase,
      commissionPercent: catalog.commissionPercent,
      commissionAmount,
      providerEarnings,
      stripePaymentIntentId: stripePaymentIntentId || undefined,
    });

    // Free services: mark paid immediately
    if (amountToPay === 0) {
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
        amount: amountToPay,
        paymentSummary: summary,
      },
      "Booking created",
      201
    );
  } catch (error: any) {
    console.error("Booking creation error:", error);
    return errorResponse(error.message || "Failed to create booking", 500);
  }
}
