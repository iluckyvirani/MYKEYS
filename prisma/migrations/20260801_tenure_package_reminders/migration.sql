-- Tenure end date + package renew reminder tracking
ALTER TABLE "PropertyTenancy" ADD COLUMN IF NOT EXISTS "endsAt" TIMESTAMP(3);

UPDATE "PropertyTenancy"
SET "endsAt" = CASE
  WHEN "tenure" = 'SIX_MONTHS' THEN "agreementDate" + INTERVAL '6 months'
  ELSE "agreementDate" + INTERVAL '12 months'
END
WHERE "endsAt" IS NULL;

ALTER TABLE "PropertyTenancy" ALTER COLUMN "endsAt" SET NOT NULL;

CREATE INDEX IF NOT EXISTS "PropertyTenancy_status_endsAt_idx" ON "PropertyTenancy"("status", "endsAt");

ALTER TABLE "OwnerPackage" ADD COLUMN IF NOT EXISTS "lastRenewReminderKey" TEXT;
