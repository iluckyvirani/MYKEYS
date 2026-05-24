-- Add categories array field to ServiceProvider for multi-category support
ALTER TABLE "ServiceProvider" ADD COLUMN "categories" TEXT[] NOT NULL DEFAULT '{}';

-- Backfill: populate categories from existing single category value
UPDATE "ServiceProvider" SET "categories" = ARRAY["category"];
