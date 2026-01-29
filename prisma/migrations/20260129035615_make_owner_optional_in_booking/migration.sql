-- DropForeignKey
ALTER TABLE "Booking" DROP CONSTRAINT "Booking_ownerId_fkey";

-- AlterTable
ALTER TABLE "Booking" ALTER COLUMN "ownerId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
