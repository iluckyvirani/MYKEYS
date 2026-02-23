-- AlterTable Package: Add new columns for features
ALTER TABLE "Package" ADD COLUMN "dailyLeadsLimit" INTEGER NOT NULL DEFAULT 2;
ALTER TABLE "Package" ADD COLUMN "totalLeadsLimit" INTEGER NOT NULL DEFAULT 10;
ALTER TABLE "Package" ADD COLUMN "hasVerifiedBadge" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Package" ADD COLUMN "supportLevel" TEXT NOT NULL DEFAULT 'standard';
ALTER TABLE "Package" ADD COLUMN "featuresIncluded" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- AlterTable OwnerPackage: Add new columns for usage tracking
ALTER TABLE "OwnerPackage" ADD COLUMN "leadsUsedToday" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "OwnerPackage" ADD COLUMN "leadsUsedTotal" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "OwnerPackage" ADD COLUMN "verifiedBadgeActive" BOOLEAN NOT NULL DEFAULT false;
