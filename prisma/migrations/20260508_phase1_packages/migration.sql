-- Phase 1: Owner Packages — Schema Migration
-- Removes tier-based packages, adds dynamic duration + feature flags, adds AdminSettings, adds Payment commission fields

-- =====================================================
-- 1. Package model — add new columns
-- =====================================================

-- Duration (replaces old `duration String`)
ALTER TABLE "Package" ADD COLUMN IF NOT EXISTS "durationValue" INTEGER NOT NULL DEFAULT 1;
ALTER TABLE "Package" ADD COLUMN IF NOT EXISTS "durationUnit" TEXT NOT NULL DEFAULT 'months';

-- Feature flags
ALTER TABLE "Package" ADD COLUMN IF NOT EXISTS "showOwnerName" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Package" ADD COLUMN IF NOT EXISTS "showOwnerPhone" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Package" ADD COLUMN IF NOT EXISTS "directInquiryToOwner" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Package" ADD COLUMN IF NOT EXISTS "adminCCOnInquiry" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Package" ADD COLUMN IF NOT EXISTS "fullAdminSupport" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Package" ADD COLUMN IF NOT EXISTS "docExpiryAlert" BOOLEAN NOT NULL DEFAULT false;

-- Short description
ALTER TABLE "Package" ADD COLUMN IF NOT EXISTS "shortDescription" TEXT;

-- =====================================================
-- 2. Package model — drop old columns
-- =====================================================

ALTER TABLE "Package" DROP COLUMN IF EXISTS "tier";
ALTER TABLE "Package" DROP COLUMN IF EXISTS "duration";
ALTER TABLE "Package" DROP COLUMN IF EXISTS "storageLimit";
ALTER TABLE "Package" DROP COLUMN IF EXISTS "dailyLeadsLimit";
ALTER TABLE "Package" DROP COLUMN IF EXISTS "totalLeadsLimit";
ALTER TABLE "Package" DROP COLUMN IF EXISTS "hasVerifiedBadge";
ALTER TABLE "Package" DROP COLUMN IF EXISTS "supportType";
ALTER TABLE "Package" DROP COLUMN IF EXISTS "supportLevel";
ALTER TABLE "Package" DROP COLUMN IF EXISTS "features";
ALTER TABLE "Package" DROP COLUMN IF EXISTS "featuresIncluded";

-- =====================================================
-- 3. Drop PackageTier enum (now unused)
-- =====================================================

DROP TYPE IF EXISTS "PackageTier";

-- =====================================================
-- 4. AdminSettings — new singleton table
-- =====================================================

CREATE TABLE IF NOT EXISTS "AdminSettings" (
  "id"                         TEXT NOT NULL DEFAULT 'singleton',
  "shortRentCommissionPercent" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "updatedAt"                  TIMESTAMP(3) NOT NULL,
  CONSTRAINT "AdminSettings_pkey" PRIMARY KEY ("id")
);

-- Insert the singleton row if not present
INSERT INTO "AdminSettings" ("id", "shortRentCommissionPercent", "updatedAt")
VALUES ('singleton', 0, NOW())
ON CONFLICT ("id") DO NOTHING;

-- =====================================================
-- 5. Payment model — add commission fields
-- =====================================================

ALTER TABLE "Payment" ADD COLUMN IF NOT EXISTS "commissionPercent" DOUBLE PRECISION;
ALTER TABLE "Payment" ADD COLUMN IF NOT EXISTS "commissionAmount" DOUBLE PRECISION;
ALTER TABLE "Payment" ADD COLUMN IF NOT EXISTS "ownerEarnings" DOUBLE PRECISION;

-- Update currency default to GBP for new rows (existing rows unaffected)
ALTER TABLE "Payment" ALTER COLUMN "currency" SET DEFAULT 'GBP';
