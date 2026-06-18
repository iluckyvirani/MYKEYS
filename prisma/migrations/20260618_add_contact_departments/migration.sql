-- CreateTable
CREATE TABLE "ContactDepartment" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "icon" TEXT NOT NULL DEFAULT 'help-circle',
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ContactDepartment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ContactDepartment_isActive_sortOrder_idx" ON "ContactDepartment"("isActive", "sortOrder");

-- Seed default departments
INSERT INTO "ContactDepartment" ("id", "name", "email", "phone", "description", "icon", "sortOrder", "isActive", "createdAt", "updatedAt") VALUES
('dept_short_rent', 'Short Rent Support', 'shortstay@propertyplatform.com', '+44 20 1234 5670', 'Instant bookings, payments, stay issues', 'hotel', 1, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('dept_long_rent', 'Long Term Rentals', 'longterm@propertyplatform.com', '+44 20 1234 5671', 'Rental inquiries, agreements, management', 'clock', 2, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('dept_buy', 'Property Sales', 'sales@propertyplatform.com', '+44 20 1234 5672', 'Purchase inquiries, viewing, negotiations', 'trending-up', 3, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('dept_safety', 'Verification & Safety', 'safety@propertyplatform.com', '+44 20 1234 5674', 'Account verification, disputes, security', 'shield', 4, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('dept_partners', 'Business Partnerships', 'partners@propertyplatform.com', '+44 20 1234 5675', 'Corporate accounts, partnerships', 'users', 5, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
