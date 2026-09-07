-- CreateEnum
CREATE TYPE "FaqCategory" AS ENUM ('LISTING', 'OWNER', 'USER', 'SHORT_RENT', 'LONG_RENT', 'BUY', 'SERVICE', 'GENERAL');

-- CreateEnum
CREATE TYPE "FaqStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateTable
CREATE TABLE "Faq" (
    "id" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "category" "FaqCategory" NOT NULL,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "status" "FaqStatus" NOT NULL DEFAULT 'ACTIVE',
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Faq_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Faq_category_status_idx" ON "Faq"("category", "status");

-- CreateIndex
CREATE INDEX "Faq_status_idx" ON "Faq"("status");

-- CreateIndex
CREATE INDEX "Faq_featured_idx" ON "Faq"("featured");

-- Seed default FAQs
INSERT INTO "Faq" ("id", "question", "answer", "category", "tags", "sortOrder", "status", "featured", "createdAt", "updatedAt") VALUES
('faq_listing_1', 'How much does it cost to list?', 'Listing is completely free. You only pay if you upgrade to a paid owner package.', 'LISTING', ARRAY['pricing','listing'], 1, 'ACTIVE', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('faq_listing_2', 'How do I get paid?', 'For short rents, we handle payments securely. For long rents and sales, you receive payments directly from tenants or buyers.', 'LISTING', ARRAY['payments','owners'], 2, 'ACTIVE', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('faq_listing_3', 'Can I list multiple properties?', 'Yes. Each package includes a property limit — upgrade your plan to list more properties.', 'LISTING', ARRAY['packages','listing'], 3, 'ACTIVE', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('faq_listing_4', 'How long does verification take?', 'Property verification typically takes 24–48 hours after documents are submitted.', 'LISTING', ARRAY['verification'], 4, 'ACTIVE', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('faq_short_1', 'How does short rent booking work?', 'Browse properties, select dates, book instantly, and pay securely. Payment is released to the owner after check-in.', 'SHORT_RENT', ARRAY['booking','payment'], 1, 'ACTIVE', false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('faq_short_2', 'Can I book for just one night?', 'Minimum stay varies by property. Most require at least 2 nights, especially on weekends.', 'SHORT_RENT', ARRAY['minimum-stay'], 2, 'ACTIVE', false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('faq_long_1', 'What is the minimum stay for long term rentals?', 'Long term rentals usually require at least 2 months. Many owners prefer 6–12 month agreements.', 'LONG_RENT', ARRAY['duration','lease'], 1, 'ACTIVE', false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('faq_long_2', 'How quickly do owners respond to inquiries?', 'Most owners respond within 24 hours. Response rates are shown on each listing.', 'LONG_RENT', ARRAY['inquiries'], 2, 'ACTIVE', false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('faq_buy_1', 'How do property purchases work?', 'Send inquiries to owners. We help with verification and connection; final sale terms are agreed between buyer and seller.', 'BUY', ARRAY['purchase','inquiry'], 1, 'ACTIVE', false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('faq_owner_1', 'What commission do you charge property owners?', 'Commission varies by service type and package. Check your owner package for exact rates.', 'OWNER', ARRAY['commission','fees'], 1, 'ACTIVE', false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('faq_user_1', 'How are payments secured for short rents?', 'Payments are held securely until after check-in. Our support team can help if issues arise.', 'USER', ARRAY['security','payments'], 1, 'ACTIVE', false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('faq_user_2', 'How are properties and owners verified?', 'We verify ID, property documents, and in some cases inspect listings. Verified listings show a badge.', 'USER', ARRAY['verification','trust'], 2, 'ACTIVE', false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('faq_service_1', 'How do I become a service provider?', 'Register from the Services page, complete your profile, and start accepting bookings once approved.', 'SERVICE', ARRAY['provider','register'], 1, 'ACTIVE', false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('faq_general_1', 'How can I contact support?', 'Use live chat on the contact page or email our support team. We typically respond within one business day.', 'GENERAL', ARRAY['support','contact'], 1, 'ACTIVE', false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
