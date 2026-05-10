import { NextRequest } from "next/server";
import { processDocumentExpiry } from "@/lib/documents/documentService";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/lib/response";

/**
 * GET /api/cron/expire-documents
 * Daily cron job:
 *  1. Marks documents with past expiryDate as EXPIRED.
 *  2. Sets properties with expired required docs to INACTIVE.
 *  3. Creates owner notifications for documents expiring within 30 days.
 *  4. Notifies admin when a property is paused.
 *
 * Secured by CRON_SECRET env var (set in Vercel + vercel.json headers).
 */
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return errorResponse("Unauthorized", 401);
  }

  try {
    const { expiredCount, expiringSoon } = await processDocumentExpiry();

    // ── Notifications: expiring soon ──────────────────────────────────────────
    for (const doc of expiringSoon) {
      const { property, documentType } = doc;
      if (!property) continue;

      // Only notify if owner's active package has docExpiryAlert
      const ownerPackage = await prisma.ownerPackage.findFirst({
        where: {
          ownerId: property.ownerId,
          status: "ACTIVE",
        },
        include: { package: { select: { docExpiryAlert: true } } },
      });

      if (!ownerPackage?.package?.docExpiryAlert) continue;

      const expiryStr = doc.expiryDate
        ? new Date(doc.expiryDate).toLocaleDateString("en-GB")
        : "soon";

      await prisma.notification.create({
        data: {
          userId: property.ownerId,
          type: "DOCUMENT_EXPIRY_WARNING",
          title: "Document Expiring Soon",
          message: `Your "${documentType.name}" for "${property.title}" expires on ${expiryStr}. Upload a new document to keep your listing active.`,
          data: {
            propertyId: property.id,
            documentTypeId: documentType.id,
            expiryDate: doc.expiryDate,
          },
        },
      }).catch(() => {/* non-fatal */});
    }

    // ── Notifications: expired docs that caused property to go INACTIVE ───────
    const recentlyInactive = await prisma.property.findMany({
      where: {
        status: "INACTIVE",
        updatedAt: { gte: new Date(Date.now() - 2 * 60 * 1000) }, // last 2 min
      },
      select: {
        id: true,
        title: true,
        ownerId: true,
        propertyDocuments: {
          where: { status: "EXPIRED" },
          include: { documentType: { select: { name: true } } },
          take: 1,
        },
      },
    });

    for (const prop of recentlyInactive) {
      const expiredDoc = prop.propertyDocuments[0];
      const docName = expiredDoc?.documentType?.name ?? "a required document";

      await prisma.notification.create({
        data: {
          userId: prop.ownerId,
          type: "LISTING_PAUSED",
          title: "Listing Paused — Expired Document",
          message: `Your listing "${prop.title}" has been paused because ${docName} has expired. Upload a new document to re-activate.`,
          data: { propertyId: prop.id },
        },
      }).catch(() => {/* non-fatal */});
    }

    return successResponse(
      { expiredCount, expiringSoonCount: expiringSoon.length },
      "Document expiry job completed"
    );
  } catch (err: unknown) {
    console.error("[cron/expire-documents]", err);
    return errorResponse("Internal server error", 500);
  }
}
