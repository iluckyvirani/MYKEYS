-- Phase 4: Inquiry Chat System
-- Adds InquiryMessage, InquiryReminder models and new fields on Inquiry

-- Add new columns to Inquiry table
ALTER TABLE "Inquiry" ADD COLUMN IF NOT EXISTS "lastMessageAt" TIMESTAMP(3);
ALTER TABLE "Inquiry" ADD COLUMN IF NOT EXISTS "lastMessageBy" TEXT;
ALTER TABLE "Inquiry" ADD COLUMN IF NOT EXISTS "unreadByOwner" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "Inquiry" ADD COLUMN IF NOT EXISTS "unreadByUser" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "Inquiry" ADD COLUMN IF NOT EXISTS "unreadByAdmin" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "Inquiry" ADD COLUMN IF NOT EXISTS "userLabel" TEXT;
ALTER TABLE "Inquiry" ADD COLUMN IF NOT EXISTS "ownerLabel" TEXT;
ALTER TABLE "Inquiry" ADD COLUMN IF NOT EXISTS "isDeletedByUser" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Inquiry" ADD COLUMN IF NOT EXISTS "isDeletedByOwner" BOOLEAN NOT NULL DEFAULT false;

-- Create index on lastMessageAt
CREATE INDEX IF NOT EXISTS "Inquiry_lastMessageAt_idx" ON "Inquiry"("lastMessageAt");

-- Create InquiryMessage table
CREATE TABLE IF NOT EXISTS "InquiryMessage" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "messageType" TEXT NOT NULL DEFAULT 'TEXT',
    "senderRole" TEXT NOT NULL,
    "inquiryId" TEXT NOT NULL,
    "senderId" TEXT,
    "readBy" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InquiryMessage_pkey" PRIMARY KEY ("id")
);

-- Create indexes on InquiryMessage
CREATE INDEX IF NOT EXISTS "InquiryMessage_inquiryId_idx" ON "InquiryMessage"("inquiryId");
CREATE INDEX IF NOT EXISTS "InquiryMessage_createdAt_idx" ON "InquiryMessage"("createdAt");
CREATE INDEX IF NOT EXISTS "InquiryMessage_senderId_idx" ON "InquiryMessage"("senderId");

-- Add foreign key constraints for InquiryMessage
ALTER TABLE "InquiryMessage" ADD CONSTRAINT "InquiryMessage_inquiryId_fkey"
    FOREIGN KEY ("inquiryId") REFERENCES "Inquiry"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "InquiryMessage" ADD CONSTRAINT "InquiryMessage_senderId_fkey"
    FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Create InquiryReminder table
CREATE TABLE IF NOT EXISTS "InquiryReminder" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "scheduledAt" TIMESTAMP(3) NOT NULL,
    "note" TEXT,
    "remindOwner" BOOLEAN NOT NULL DEFAULT true,
    "remindAdmin" BOOLEAN NOT NULL DEFAULT false,
    "isCompleted" BOOLEAN NOT NULL DEFAULT false,
    "notifiedAt" TIMESTAMP(3),
    "inquiryId" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InquiryReminder_pkey" PRIMARY KEY ("id")
);

-- Create indexes on InquiryReminder
CREATE INDEX IF NOT EXISTS "InquiryReminder_inquiryId_idx" ON "InquiryReminder"("inquiryId");
CREATE INDEX IF NOT EXISTS "InquiryReminder_scheduledAt_idx" ON "InquiryReminder"("scheduledAt");

-- Add foreign key constraints for InquiryReminder
ALTER TABLE "InquiryReminder" ADD CONSTRAINT "InquiryReminder_inquiryId_fkey"
    FOREIGN KEY ("inquiryId") REFERENCES "Inquiry"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "InquiryReminder" ADD CONSTRAINT "InquiryReminder_createdById_fkey"
    FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
