-- CreateEnum for DocumentType
CREATE TYPE "DocumentType" AS ENUM ('PAN_CARD', 'AADHAR_CARD', 'DRIVING_LICENSE', 'PASSPORT', 'VOTER_ID', 'PROPERTY_LICENSE', 'BUSINESS_LICENSE', 'GST_CERTIFICATE', 'TAX_IDENTIFICATION', 'RENTAL_AGREEMENT_TEMPLATE');

-- CreateEnum for DocumentStatus
CREATE TYPE "DocumentStatus" AS ENUM ('PENDING', 'VERIFIED', 'REJECTED', 'EXPIRED');

-- CreateTable for Document
CREATE TABLE "Document" (
    "id" TEXT NOT NULL,
    "documentType" "DocumentType" NOT NULL,
    "documentUrl" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "mimeType" TEXT,
    "status" "DocumentStatus" NOT NULL DEFAULT 'PENDING',
    "verifiedNotes" TEXT,
    "verifiedBy" TEXT,
    "verifiedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Document_pkey" PRIMARY KEY ("id")
);

-- CreateIndex for Document
CREATE INDEX "Document_userId_idx" ON "Document"("userId");
CREATE INDEX "Document_documentType_idx" ON "Document"("documentType");
CREATE INDEX "Document_status_idx" ON "Document"("status");
CREATE INDEX "Document_createdAt_idx" ON "Document"("createdAt");

-- AddForeignKey for Document
ALTER TABLE "Document" ADD CONSTRAINT "Document_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
