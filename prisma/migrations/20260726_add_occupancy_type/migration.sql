DO $$ BEGIN
  CREATE TYPE "OccupancyType" AS ENUM ('WHOLE_PROPERTY', 'ROOM');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

ALTER TABLE "Property" ADD COLUMN IF NOT EXISTS "occupancyType" "OccupancyType";

-- Existing long lets without a type default to whole property
UPDATE "Property"
SET "occupancyType" = 'WHOLE_PROPERTY'
WHERE "listingType" = 'RENT'
  AND "rentalType" = 'LONG_TERM'
  AND "occupancyType" IS NULL;
