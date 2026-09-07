-- AlterEnum: add AGENT to RoleType
ALTER TYPE "RoleType" ADD VALUE IF NOT EXISTS 'AGENT';

-- CreateEnum
CREATE TYPE "PackageAudience" AS ENUM ('OWNER', 'AGENT');

-- AlterTable
ALTER TABLE "Package" ADD COLUMN IF NOT EXISTS "audience" "PackageAudience" NOT NULL DEFAULT 'OWNER';

-- Migrate existing listingSellerType=AGENT users to AGENT role
INSERT INTO "UserRoleAssignment" ("id", "userId", "role", "createdAt")
SELECT
  gen_random_uuid()::text,
  u."id",
  'AGENT'::"RoleType",
  NOW()
FROM "User" u
WHERE u."listingSellerType" = 'AGENT'
  AND NOT EXISTS (
    SELECT 1 FROM "UserRoleAssignment" ura
    WHERE ura."userId" = u."id" AND ura."role" = 'AGENT'
  );

-- Clear deprecated seller type flag
UPDATE "User" SET "listingSellerType" = NULL WHERE "listingSellerType" = 'AGENT';
