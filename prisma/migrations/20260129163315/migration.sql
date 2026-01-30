/*
  Warnings:

  - You are about to drop the column `bio` on the `User` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "AuditLog_performedBy_idx";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "bio",
ADD COLUMN     "address" TEXT,
ADD COLUMN     "birthDate" TEXT,
ADD COLUMN     "city" TEXT,
ADD COLUMN     "country" TEXT,
ADD COLUMN     "emergencyContact" TEXT,
ADD COLUMN     "emergencyName" TEXT,
ADD COLUMN     "state" TEXT,
ADD COLUMN     "zipCode" TEXT;

-- RenameIndex
ALTER INDEX "Review_bookingId_unique" RENAME TO "Review_bookingId_key";
