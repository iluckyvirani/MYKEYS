-- AlterTable
ALTER TABLE "AdminSettings"
ADD COLUMN "contactSupportEmail" TEXT NOT NULL DEFAULT 'support@propertyplatform.com',
ADD COLUMN "contactSupportPhone" TEXT NOT NULL DEFAULT '+44 20 1234 5678',
ADD COLUMN "contactSupportDescription" TEXT NOT NULL DEFAULT 'Whether you''re looking for a property, listing yours, or need support, our team is ready to assist you.';

-- CreateTable
CREATE TABLE "ContactQuery" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "subject" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "inquiryType" TEXT NOT NULL,
    "propertyType" TEXT,
    "urgency" TEXT NOT NULL DEFAULT 'normal',
    "status" TEXT NOT NULL DEFAULT 'NEW',
    "adminNote" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ContactQuery_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ContactQuery_status_createdAt_idx" ON "ContactQuery"("status", "createdAt");

-- CreateIndex
CREATE INDEX "ContactQuery_inquiryType_createdAt_idx" ON "ContactQuery"("inquiryType", "createdAt");
