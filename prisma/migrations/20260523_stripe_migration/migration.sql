-- Migration: Replace Razorpay fields with Stripe fields
-- Affected tables: Payment, PropertyBid

-- ── Payment table ─────────────────────────────────────────────────────────────
ALTER TABLE "Payment" RENAME COLUMN "razorpayOrderId"   TO "stripePaymentIntentId";
ALTER TABLE "Payment" RENAME COLUMN "razorpayPaymentId" TO "stripeChargeId";
ALTER TABLE "Payment" DROP COLUMN IF EXISTS "razorpaySignature";

-- ── PropertyBid table ─────────────────────────────────────────────────────────
ALTER TABLE "PropertyBid" RENAME COLUMN "razorpayOrderId"   TO "stripePaymentIntentId";
ALTER TABLE "PropertyBid" RENAME COLUMN "razorpayPaymentId" TO "stripeChargeId";
ALTER TABLE "PropertyBid" DROP COLUMN IF EXISTS "razorpaySignature";
