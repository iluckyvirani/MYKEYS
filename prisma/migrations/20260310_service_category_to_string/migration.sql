-- Migration: Change ServiceProvider.category and ServiceBooking.category
-- from ServiceCategory enum to TEXT (stores ServiceCategoryInfo.id)

ALTER TABLE "ServiceProvider" ALTER COLUMN "category" TYPE TEXT USING "category"::TEXT;
ALTER TABLE "ServiceBooking" ALTER COLUMN "category" TYPE TEXT USING "category"::TEXT;
