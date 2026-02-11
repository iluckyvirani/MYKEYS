/*
  Warnings:

  - The values [PROFESSIONAL,ENTERPRISE] on the enum `PackageTier` will be removed. If these variants are still used in the database, this will fail.
  - Added the required column `checkInTime` to the `Property` table without a default value. This is not possible if the table is not empty.
  - Added the required column `checkOutTime` to the `Property` table without a default value. This is not possible if the table is not empty.
  - Added the required column `selfCheckIn` to the `Property` table without a default value. This is not possible if the table is not empty.
  - Added the required column `parking` to the `Property` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "PackageTier_new" AS ENUM ('BASIC', 'STANDARD', 'PREMIUM');
ALTER TABLE "Package" ALTER COLUMN "tier" TYPE "PackageTier_new" USING ("tier"::text::"PackageTier_new");
ALTER TYPE "PackageTier" RENAME TO "PackageTier_old";
ALTER TYPE "PackageTier_new" RENAME TO "PackageTier";
DROP TYPE "public"."PackageTier_old";
COMMIT;

-- AlterEnum
ALTER TYPE "PaymentMethod" ADD VALUE 'BANK_TRANSFER';

-- AlterTable
ALTER TABLE "Property" ADD COLUMN     "availableFrom" TIMESTAMP(3),
ADD COLUMN     "billsIncluded" BOOLEAN,
ADD COLUMN     "checkInTime" TEXT NOT NULL,
ADD COLUMN     "checkOutTime" TEXT NOT NULL,
ADD COLUMN     "councilTaxBand" TEXT,
ADD COLUMN     "epcRating" TEXT,
ADD COLUMN     "groundRent" INTEGER,
ADD COLUMN     "hoaFee" DOUBLE PRECISION,
ADD COLUMN     "leaseYears" INTEGER,
ADD COLUMN     "leasehold" BOOLEAN,
ADD COLUMN     "maxTerm" INTEGER,
ADD COLUMN     "minTerm" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "propertyPrice" DOUBLE PRECISION,
ADD COLUMN     "propertyTax" DOUBLE PRECISION,
ADD COLUMN     "selfCheckIn" BOOLEAN NOT NULL,
DROP COLUMN "parking",
ADD COLUMN     "parking" BOOLEAN NOT NULL,
ALTER COLUMN "status" SET DEFAULT 'ACTIVE';
