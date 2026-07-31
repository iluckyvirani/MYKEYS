CREATE TABLE "PropertyExpense" (
    "id" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "amount" DOUBLE PRECISION NOT NULL,
    "expenseDate" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "PropertyExpense_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "PropertyExpense_ownerId_idx" ON "PropertyExpense"("ownerId");
CREATE INDEX "PropertyExpense_propertyId_idx" ON "PropertyExpense"("propertyId");
CREATE INDEX "PropertyExpense_expenseDate_idx" ON "PropertyExpense"("expenseDate");
CREATE INDEX "PropertyExpense_ownerId_expenseDate_idx" ON "PropertyExpense"("ownerId", "expenseDate");
CREATE INDEX "PropertyExpense_ownerId_propertyId_idx" ON "PropertyExpense"("ownerId", "propertyId");

ALTER TABLE "PropertyExpense" ADD CONSTRAINT "PropertyExpense_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PropertyExpense" ADD CONSTRAINT "PropertyExpense_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
