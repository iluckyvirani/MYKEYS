-- Rent Management: off-platform tenants + tenancies (not User accounts)
CREATE TYPE "RentTenure" AS ENUM ('SIX_MONTHS', 'TWELVE_MONTHS');
CREATE TYPE "TenancyStatus" AS ENUM ('ACTIVE', 'ENDED', 'CANCELLED');

CREATE TABLE "PropertyTenant" (
    "id" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "PropertyTenant_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "PropertyTenancy" (
    "id" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "tenure" "RentTenure" NOT NULL,
    "agreementDate" TIMESTAMP(3) NOT NULL,
    "rentDueDay" INTEGER NOT NULL,
    "monthlyRent" DOUBLE PRECISION,
    "status" "TenancyStatus" NOT NULL DEFAULT 'ACTIVE',
    "lastDueReminderKey" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "PropertyTenancy_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "PropertyTenantDocument" (
    "id" TEXT NOT NULL,
    "tenancyId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PropertyTenantDocument_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "PropertyTenant_ownerId_idx" ON "PropertyTenant"("ownerId");
CREATE INDEX "PropertyTenant_email_idx" ON "PropertyTenant"("email");
CREATE INDEX "PropertyTenancy_propertyId_idx" ON "PropertyTenancy"("propertyId");
CREATE INDEX "PropertyTenancy_ownerId_idx" ON "PropertyTenancy"("ownerId");
CREATE INDEX "PropertyTenancy_tenantId_idx" ON "PropertyTenancy"("tenantId");
CREATE INDEX "PropertyTenancy_status_idx" ON "PropertyTenancy"("status");
CREATE INDEX "PropertyTenancy_rentDueDay_status_idx" ON "PropertyTenancy"("rentDueDay", "status");
CREATE INDEX "PropertyTenantDocument_tenancyId_idx" ON "PropertyTenantDocument"("tenancyId");

ALTER TABLE "PropertyTenant" ADD CONSTRAINT "PropertyTenant_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PropertyTenancy" ADD CONSTRAINT "PropertyTenancy_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PropertyTenancy" ADD CONSTRAINT "PropertyTenancy_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "PropertyTenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PropertyTenancy" ADD CONSTRAINT "PropertyTenancy_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PropertyTenantDocument" ADD CONSTRAINT "PropertyTenantDocument_tenancyId_fkey" FOREIGN KEY ("tenancyId") REFERENCES "PropertyTenancy"("id") ON DELETE CASCADE ON UPDATE CASCADE;
