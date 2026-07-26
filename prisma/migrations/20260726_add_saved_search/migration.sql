-- CreateEnum
DO $$ BEGIN
  CREATE TYPE "AlertFrequency" AS ENUM ('INSTANTLY', 'DAILY', 'EVERY_3_DAYS', 'EVERY_7_DAYS');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- CreateTable
CREATE TABLE IF NOT EXISTS "SavedSearch" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "listingType" "ListingType" NOT NULL,
  "rentalType" "RentalType",
  "location" TEXT NOT NULL,
  "filters" JSONB NOT NULL,
  "alertEnabled" BOOLEAN NOT NULL DEFAULT false,
  "alertFrequency" "AlertFrequency",
  "lastNotifiedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "SavedSearch_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "SavedSearch_userId_idx" ON "SavedSearch"("userId");
CREATE INDEX IF NOT EXISTS "SavedSearch_userId_listingType_idx" ON "SavedSearch"("userId", "listingType");
CREATE INDEX IF NOT EXISTS "SavedSearch_alertEnabled_idx" ON "SavedSearch"("alertEnabled");

DO $$ BEGIN
  ALTER TABLE "SavedSearch"
    ADD CONSTRAINT "SavedSearch_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;
