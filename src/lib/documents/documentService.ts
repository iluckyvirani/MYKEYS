import { prisma } from "@/lib/prisma";
import { getDocumentDateValidationError } from "@/lib/documents/documentDateValidation";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface DocumentTypeInput {
  name: string;
  description?: string;
  isRequired?: boolean;
  requireIssueDate?: boolean;
  requireExpiryDate?: boolean;
  appliesTo?: string[];
  isActive?: boolean;
  sortOrder?: number;
}

export interface PropertyDocumentInput {
  documentTypeId: string;
  documentUrl: string;
  fileName: string;
  fileSize: number;
  mimeType?: string;
  issuedDate?: string; // ISO string
  expiryDate?: string; // ISO string
}

export interface DocumentVerifyInput {
  status: "VERIFIED" | "REJECTED";
  verifiedNotes?: string;
  verifiedBy: string; // admin user id
}

// ─── Admin: Document Type Management ─────────────────────────────────────────

export async function createDocumentType(input: DocumentTypeInput) {
  return prisma.propertyDocumentType.create({
    data: {
      name: input.name,
      description: input.description,
      isRequired: input.isRequired ?? true,
      requireIssueDate: input.requireIssueDate ?? false,
      requireExpiryDate: input.requireExpiryDate ?? false,
      appliesTo: input.appliesTo ?? [],
      isActive: input.isActive ?? true,
      sortOrder: input.sortOrder ?? 0,
    },
  });
}

export async function getAllDocumentTypes(activeOnly = false) {
  return prisma.propertyDocumentType.findMany({
    where: activeOnly ? { isActive: true } : undefined,
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    include: {
      _count: { select: { propertyDocuments: true } },
    },
  });
}

export async function getDocumentTypeById(id: string) {
  return prisma.propertyDocumentType.findUnique({
    where: { id },
    include: {
      _count: { select: { propertyDocuments: true } },
    },
  });
}

export async function updateDocumentType(
  id: string,
  input: Partial<DocumentTypeInput>
) {
  return prisma.propertyDocumentType.update({
    where: { id },
    data: {
      ...(input.name !== undefined && { name: input.name }),
      ...(input.description !== undefined && {
        description: input.description,
      }),
      ...(input.isRequired !== undefined && { isRequired: input.isRequired }),
      ...(input.requireIssueDate !== undefined && {
        requireIssueDate: input.requireIssueDate,
      }),
      ...(input.requireExpiryDate !== undefined && {
        requireExpiryDate: input.requireExpiryDate,
      }),
      ...(input.appliesTo !== undefined && { appliesTo: input.appliesTo }),
      ...(input.isActive !== undefined && { isActive: input.isActive }),
      ...(input.sortOrder !== undefined && { sortOrder: input.sortOrder }),
    },
  });
}

export async function deleteDocumentType(id: string) {
  const count = await prisma.propertyDocument.count({
    where: { documentTypeId: id },
  });
  if (count > 0) {
    throw new Error(
      `Cannot delete: ${count} propert${count === 1 ? "y has" : "ies have"} uploaded this document type.`
    );
  }
  return prisma.propertyDocumentType.delete({ where: { id } });
}

// ─── Owner: Property Documents ────────────────────────────────────────────────

/**
 * Returns required document types for a property's listing/rental type.
 * appliesTo values: "ALL" | "BUY" | "RENT_LONG" | "RENT_SHORT"
 */
export async function getRequiredDocumentTypes(
  listingType: string,
  rentalType?: string | null
) {
  const tags = resolveAppliesTo(listingType, rentalType);
  const all = await prisma.propertyDocumentType.findMany({
    where: { isActive: true },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
  });
  return all.filter(
    (dt) =>
      dt.appliesTo.length === 0 ||
      dt.appliesTo.includes("ALL") ||
      dt.appliesTo.some((t) => tags.includes(t))
  );
}

export async function getPropertyDocuments(propertyId: string) {
  return prisma.propertyDocument.findMany({
    where: { propertyId },
    include: { documentType: true },
    orderBy: { createdAt: "asc" },
  });
}

export async function upsertPropertyDocument(
  propertyId: string,
  input: PropertyDocumentInput
) {
  const documentType = await prisma.propertyDocumentType.findUnique({
    where: { id: input.documentTypeId },
    select: { requireIssueDate: true, requireExpiryDate: true },
  });
  if (!documentType) {
    throw new Error("Document type not found");
  }

  const dateError = getDocumentDateValidationError(
    input.issuedDate ?? "",
    input.expiryDate ?? "",
    {
      requireIssueDate: documentType.requireIssueDate,
      requireExpiryDate: documentType.requireExpiryDate,
    }
  );
  if (dateError) {
    throw new Error(dateError);
  }

  // One document per type per property — if already exists, replace it
  const existing = await prisma.propertyDocument.findFirst({
    where: { propertyId, documentTypeId: input.documentTypeId },
  });

  const data = {
    documentUrl: input.documentUrl,
    fileName: input.fileName,
    fileSize: input.fileSize,
    mimeType: input.mimeType,
    issuedDate: input.issuedDate ? new Date(input.issuedDate) : null,
    expiryDate: input.expiryDate ? new Date(input.expiryDate) : null,
    status: "PENDING",
    verifiedNotes: null as string | null,
    verifiedBy: null as string | null,
    verifiedAt: null as Date | null,
  };

  if (existing) {
    return prisma.propertyDocument.update({ where: { id: existing.id }, data });
  }
  return prisma.propertyDocument.create({
    data: { ...data, propertyId, documentTypeId: input.documentTypeId },
  });
}

export async function updatePropertyDocument(
  docId: string,
  propertyId: string,
  input: Partial<PropertyDocumentInput>
) {
  const existing = await prisma.propertyDocument.findFirst({
    where: { id: docId, propertyId },
  });
  if (!existing) throw new Error("Document not found");

  const documentType = await prisma.propertyDocumentType.findUnique({
    where: { id: existing.documentTypeId },
    select: { requireIssueDate: true, requireExpiryDate: true },
  });

  const nextIssued =
    input.issuedDate !== undefined
      ? input.issuedDate
      : existing.issuedDate?.toISOString().slice(0, 10) ?? "";
  const nextExpiry =
    input.expiryDate !== undefined
      ? input.expiryDate
      : existing.expiryDate?.toISOString().slice(0, 10) ?? "";

  const dateError = getDocumentDateValidationError(nextIssued, nextExpiry, {
    requireIssueDate: documentType?.requireIssueDate,
    requireExpiryDate: documentType?.requireExpiryDate,
  });
  if (dateError) {
    throw new Error(dateError);
  }

  return prisma.propertyDocument.update({
    where: { id: docId },
    data: {
      ...(input.documentUrl && { documentUrl: input.documentUrl }),
      ...(input.fileName && { fileName: input.fileName }),
      ...(input.fileSize && { fileSize: input.fileSize }),
      ...(input.mimeType !== undefined && { mimeType: input.mimeType }),
      ...(input.issuedDate !== undefined && {
        issuedDate: input.issuedDate ? new Date(input.issuedDate) : null,
      }),
      ...(input.expiryDate !== undefined && {
        expiryDate: input.expiryDate ? new Date(input.expiryDate) : null,
      }),
      // Re-uploaded → reset status to PENDING
      status: "PENDING",
      verifiedNotes: null,
      verifiedBy: null,
      verifiedAt: null,
    },
  });
}

export async function deletePropertyDocument(
  docId: string,
  propertyId: string
) {
  const existing = await prisma.propertyDocument.findFirst({
    where: { id: docId, propertyId },
  });
  if (!existing) throw new Error("Document not found");
  return prisma.propertyDocument.delete({ where: { id: docId } });
}

// ─── Admin: Verify / Reject ───────────────────────────────────────────────────

export async function verifyPropertyDocument(
  docId: string,
  input: DocumentVerifyInput
) {
  const updated = await prisma.propertyDocument.update({
    where: { id: docId },
    data: {
      status: input.status,
      verifiedNotes: input.verifiedNotes ?? null,
      verifiedBy: input.verifiedBy,
      verifiedAt: new Date(),
    },
    include: {
      documentType: { select: { name: true } },
      property: { select: { id: true, title: true, ownerId: true } },
    },
  });

  await enforcePropertyInactiveUntilDocumentsVerified(updated.property.id);

  return updated;
}

// ─── Cron: Check expiry ───────────────────────────────────────────────────────

/**
 * Run daily.
 * 1. Mark EXPIRED documents whose expiryDate has passed.
 * 2. Return documents expiring in next 30 days so cron handler can notify owners.
 */
export async function processDocumentExpiry() {
  const now = new Date();
  const in30Days = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

  // Mark expired
  const expired = await prisma.propertyDocument.updateMany({
    where: {
      status: { in: ["PENDING", "VERIFIED"] },
      expiryDate: { lt: now },
    },
    data: { status: "EXPIRED" },
  });

  // Find documents expiring soon (not already expired)
  const expiringSoon = await prisma.propertyDocument.findMany({
    where: {
      status: "VERIFIED",
      expiryDate: { gte: now, lte: in30Days },
    },
    include: {
      documentType: { select: { id: true, name: true } },
      property: {
        select: {
          id: true,
          title: true,
          ownerId: true,
          status: true,
        },
      },
    },
  });

  // Properties with expired REQUIRED docs → set INACTIVE
  const requiredTypeIds = await prisma.propertyDocumentType
    .findMany({ where: { isRequired: true, isActive: true }, select: { id: true } })
    .then((r) => r.map((x) => x.id));

  // Find active properties that now have EXPIRED required docs
  if (requiredTypeIds.length > 0) {
    const problematicPropertyIds = await prisma.propertyDocument
      .findMany({
        where: {
          status: "EXPIRED",
          documentTypeId: { in: requiredTypeIds },
          property: { status: "ACTIVE" },
        },
        select: { propertyId: true },
        distinct: ["propertyId"],
      })
      .then((r) => r.map((x) => x.propertyId));

    if (problematicPropertyIds.length > 0) {
      await prisma.property.updateMany({
        where: { id: { in: problematicPropertyIds } },
        data: { status: "INACTIVE" },
      });
    }
  }

  return { expiredCount: expired.count, expiringSoon };
}

// ─── Gate check: can property be published? ───────────────────────────────────

export type PropertyDocumentVerificationState = {
  hasRequiredDocuments: boolean;
  allVerified: boolean;
  pendingReview: boolean;
  missingUpload: boolean;
  hasRejected: boolean;
  canActivate: boolean;
};

/**
 * Document verification state for a single property.
 */
export async function getPropertyDocumentVerificationState(
  propertyId: string,
  listingType: string,
  rentalType?: string | null
): Promise<PropertyDocumentVerificationState> {
  const required = (await getRequiredDocumentTypes(listingType, rentalType)).filter(
    (dt) => dt.isRequired
  );

  if (required.length === 0) {
    return {
      hasRequiredDocuments: false,
      allVerified: true,
      pendingReview: false,
      missingUpload: false,
      hasRejected: false,
      canActivate: true,
    };
  }

  const docs = await prisma.propertyDocument.findMany({
    where: {
      propertyId,
      documentTypeId: { in: required.map((d) => d.id) },
    },
    select: { documentTypeId: true, status: true },
  });
  const byType = new Map(docs.map((d) => [d.documentTypeId, d.status]));

  let missingUpload = false;
  let pendingReview = false;
  let hasRejected = false;

  for (const dt of required) {
    const status = byType.get(dt.id);
    if (!status) missingUpload = true;
    else if (status === "PENDING") pendingReview = true;
    else if (status === "REJECTED") hasRejected = true;
    else if (status !== "VERIFIED") missingUpload = true;
  }

  const allVerified =
    !missingUpload &&
    !pendingReview &&
    !hasRejected &&
    required.every((dt) => byType.get(dt.id) === "VERIFIED");

  return {
    hasRequiredDocuments: true,
    allVerified,
    pendingReview,
    missingUpload,
    hasRejected,
    canActivate: allVerified,
  };
}

export async function getDocumentVerificationStatesForProperties(
  properties: Array<{
    id: string;
    listingType: string;
    rentalType?: string | null;
  }>
): Promise<Map<string, PropertyDocumentVerificationState>> {
  const result = new Map<string, PropertyDocumentVerificationState>();
  await Promise.all(
    properties.map(async (p) => {
      const state = await getPropertyDocumentVerificationState(
        p.id,
        p.listingType,
        p.rentalType
      );
      result.set(p.id, state);
    })
  );
  return result;
}

export function documentVerificationBlockMessage(
  state: PropertyDocumentVerificationState
): string {
  if (!state.hasRequiredDocuments || state.allVerified) return "";
  if (state.missingUpload) {
    return "Upload all required property documents before activating this listing.";
  }
  if (state.hasRejected) {
    return "One or more documents were rejected. Re-upload and wait for admin verification.";
  }
  if (state.pendingReview) {
    return "Documents are pending admin verification. Your listing will stay inactive until approved.";
  }
  return "Property documents must be verified by admin before this listing can go active.";
}

/**
 * If property is ACTIVE but required documents are not all verified, set INACTIVE.
 */
export async function enforcePropertyInactiveUntilDocumentsVerified(
  propertyId: string
): Promise<void> {
  const property = await prisma.property.findUnique({
    where: { id: propertyId },
    select: {
      id: true,
      status: true,
      listingType: true,
      rentalType: true,
      ownerId: true,
    },
  });
  if (!property || property.status !== "ACTIVE") return;

  const state = await getPropertyDocumentVerificationState(
    propertyId,
    property.listingType,
    property.rentalType
  );
  if (!state.hasRequiredDocuments || state.allVerified) return;

  await prisma.property.update({
    where: { id: propertyId },
    data: { status: "INACTIVE" },
  });

  const isGated =
    property.listingType === "BUY" ||
    (property.listingType === "RENT" && property.rentalType !== "SHORT_TERM");

  if (isGated) {
    const { packageService } = await import("@/lib/packages/packageService");
    await packageService.decrementPropertyUsage(property.ownerId);
  }
}

/**
 * Returns missing required document types for a property.
 * An empty array means all requirements are met.
 */
export async function getMissingRequiredDocuments(
  propertyId: string,
  listingType: string,
  rentalType?: string | null
) {
  const required = await getRequiredDocumentTypes(listingType, rentalType);
  if (required.length === 0) return [];

  const uploaded = await prisma.propertyDocument.findMany({
    where: {
      propertyId,
      status: { in: ["PENDING", "VERIFIED"] },
    },
    select: { documentTypeId: true, status: true },
  });

  const uploadedMap = new Map(uploaded.map((u) => [u.documentTypeId, u.status]));

  return required.filter((dt) => {
    if (!dt.isRequired) return false;
    return !uploadedMap.has(dt.id);
  });
}

// ─── Helper ───────────────────────────────────────────────────────────────────

function resolveAppliesTo(
  listingType: string,
  rentalType?: string | null
): string[] {
  if (listingType === "BUY") return ["BUY"];
  if (listingType === "RENT") {
    if (rentalType === "SHORT_TERM") return ["RENT_SHORT"];
    if (rentalType === "LONG_TERM") return ["RENT_LONG"];
    return ["RENT_LONG", "RENT_SHORT"];
  }
  return [];
}
