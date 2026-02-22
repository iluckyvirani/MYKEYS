-- CreateTable
CREATE TABLE "InquiryNote" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "inquiryId" TEXT NOT NULL,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InquiryNote_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "InquiryNote_inquiryId_idx" ON "InquiryNote"("inquiryId");

-- AddForeignKey
ALTER TABLE "InquiryNote" ADD CONSTRAINT "InquiryNote_inquiryId_fkey" FOREIGN KEY ("inquiryId") REFERENCES "Inquiry"("id") ON DELETE CASCADE ON UPDATE CASCADE;
