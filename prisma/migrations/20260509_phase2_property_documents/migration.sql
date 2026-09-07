-- Phase 2: Property Documents (Admin-Defined Required Documents)

-- CreateTable: PropertyDocumentType
CREATE TABLE "PropertyDocumentType" (
    "id"                TEXT NOT NULL,
    "name"              TEXT NOT NULL,
    "description"       TEXT,
    "isRequired"        BOOLEAN NOT NULL DEFAULT true,
    "requireIssueDate"  BOOLEAN NOT NULL DEFAULT false,
    "requireExpiryDate" BOOLEAN NOT NULL DEFAULT false,
    "appliesTo"         TEXT[] DEFAULT ARRAY[]::TEXT[],
    "isActive"          BOOLEAN NOT NULL DEFAULT true,
    "sortOrder"         INTEGER NOT NULL DEFAULT 0,
    "createdAt"         TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"         TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PropertyDocumentType_pkey" PRIMARY KEY ("id")
);

-- CreateTable: PropertyDocument
CREATE TABLE "PropertyDocument" (
    "id"             TEXT NOT NULL,
    "documentUrl"    TEXT NOT NULL,
    "fileName"       TEXT NOT NULL,
    "fileSize"       INTEGER NOT NULL,
    "mimeType"       TEXT,
    "issuedDate"     TIMESTAMP(3),
    "expiryDate"     TIMESTAMP(3),
    "status"         TEXT NOT NULL DEFAULT 'PENDING',
    "verifiedNotes"  TEXT,
    "verifiedBy"     TEXT,
    "verifiedAt"     TIMESTAMP(3),
    "propertyId"     TEXT NOT NULL,
    "documentTypeId" TEXT NOT NULL,
    "createdAt"      TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"      TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PropertyDocument_pkey" PRIMARY KEY ("id")
);

-- CreateIndex: PropertyDocumentType unique name
CREATE UNIQUE INDEX "PropertyDocumentType_name_key" ON "PropertyDocumentType"("name");

-- CreateIndex
CREATE INDEX "PropertyDocumentType_isActive_idx" ON "PropertyDocumentType"("isActive");
CREATE INDEX "PropertyDocument_propertyId_idx"     ON "PropertyDocument"("propertyId");
CREATE INDEX "PropertyDocument_documentTypeId_idx" ON "PropertyDocument"("documentTypeId");
CREATE INDEX "PropertyDocument_expiryDate_idx"     ON "PropertyDocument"("expiryDate");
CREATE INDEX "PropertyDocument_status_idx"         ON "PropertyDocument"("status");

-- AddForeignKey
ALTER TABLE "PropertyDocument"
    ADD CONSTRAINT "PropertyDocument_propertyId_fkey"
    FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "PropertyDocument"
    ADD CONSTRAINT "PropertyDocument_documentTypeId_fkey"
    FOREIGN KEY ("documentTypeId") REFERENCES "PropertyDocumentType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
