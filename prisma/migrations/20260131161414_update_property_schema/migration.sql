/*
  Warnings:

  - Changed the type of `priceType` on the `Property` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "PriceType" AS ENUM ('NIGHTLY', 'MONTHLY', 'TOTAL');

-- AlterTable
ALTER TABLE "Property" ADD COLUMN     "occupancy" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "originalPrice" DOUBLE PRECISION,
ADD COLUMN     "revenue" DOUBLE PRECISION NOT NULL DEFAULT 0,
DROP COLUMN "priceType",
ADD COLUMN     "priceType" "PriceType" NOT NULL;
