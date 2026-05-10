-- Phase 3: Bidding / Boost for Short Rent Properties
-- Adds PropertyBid table and bid config fields to AdminSettings

-- Add bid configuration fields to AdminSettings
ALTER TABLE "AdminSettings"
  ADD COLUMN IF NOT EXISTS "minBidAmountPerDay"    DOUBLE PRECISION NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS "maxBidDurationDays"    INTEGER          NOT NULL DEFAULT 30,
  ADD COLUMN IF NOT EXISTS "maxBoostedSlotsPerZip" INTEGER          NOT NULL DEFAULT 3;

-- Create PropertyBid table
CREATE TABLE "PropertyBid" (
  "id"                 TEXT         NOT NULL,
  "zipCode"            TEXT         NOT NULL,
  "amount"             DOUBLE PRECISION NOT NULL,
  "totalCost"          DOUBLE PRECISION NOT NULL,
  "startDate"          TIMESTAMP(3) NOT NULL,
  "endDate"            TIMESTAMP(3) NOT NULL,
  "status"             TEXT         NOT NULL DEFAULT 'ACTIVE',
  "paymentId"          TEXT,
  "razorpayOrderId"    TEXT,
  "razorpayPaymentId"  TEXT,
  "razorpaySignature"  TEXT,
  "propertyId"         TEXT         NOT NULL,
  "ownerId"            TEXT         NOT NULL,
  "createdAt"          TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"          TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "PropertyBid_pkey" PRIMARY KEY ("id")
);

-- Foreign keys
ALTER TABLE "PropertyBid"
  ADD CONSTRAINT "PropertyBid_propertyId_fkey"
    FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "PropertyBid"
  ADD CONSTRAINT "PropertyBid_ownerId_fkey"
    FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Indexes
CREATE INDEX "PropertyBid_zipCode_idx"    ON "PropertyBid"("zipCode");
CREATE INDEX "PropertyBid_status_idx"     ON "PropertyBid"("status");
CREATE INDEX "PropertyBid_endDate_idx"    ON "PropertyBid"("endDate");
CREATE INDEX "PropertyBid_propertyId_idx" ON "PropertyBid"("propertyId");
CREATE INDEX "PropertyBid_ownerId_idx"    ON "PropertyBid"("ownerId");
