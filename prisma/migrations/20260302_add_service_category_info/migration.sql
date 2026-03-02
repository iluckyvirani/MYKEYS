-- Create ServiceCategoryInfo table for admin category management
CREATE TABLE IF NOT EXISTS "ServiceCategoryInfo" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "icon" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ServiceCategoryInfo_pkey" PRIMARY KEY ("id")
);

-- Create unique index on name
CREATE UNIQUE INDEX IF NOT EXISTS "ServiceCategoryInfo_name_key" ON "ServiceCategoryInfo"("name");

-- Insert default categories
INSERT INTO "ServiceCategoryInfo" ("id", "name", "description", "status", "sortOrder", "updatedAt")
VALUES 
    (gen_random_uuid()::text, 'Plumbing', 'All plumbing services including repairs, installation, and maintenance', 'active', 1, NOW()),
    (gen_random_uuid()::text, 'Electrical', 'Electrical repair and installation services for homes and offices', 'active', 2, NOW()),
    (gen_random_uuid()::text, 'Cleaning', 'Professional home and office cleaning services', 'active', 3, NOW()),
    (gen_random_uuid()::text, 'Carpentry', 'Woodwork and carpentry services for custom furniture and repairs', 'active', 4, NOW()),
    (gen_random_uuid()::text, 'Painting', 'Interior and exterior painting services', 'active', 5, NOW()),
    (gen_random_uuid()::text, 'Gardening', 'Landscaping and gardening services for outdoor spaces', 'active', 6, NOW()),
    (gen_random_uuid()::text, 'AC Repair', 'Air conditioning repair and maintenance services', 'active', 7, NOW())
ON CONFLICT ("name") DO NOTHING;
