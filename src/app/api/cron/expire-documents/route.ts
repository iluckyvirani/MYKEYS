import { NextRequest } from "next/server";
import { processDocumentExpiry } from "@/lib/documents/documentService";
import { prisma } from "@/lib/prisma";
import { emailService } from "@/lib/email/emailService";
import { successResponse, errorResponse } from "@/lib/response";

/**
 * GET /api/cron/expire-documents
 * Daily cron job:
 *  1. Marks documents with past expiryDate as EXPIRED.
 *  2. Sets properties with expired required docs to INACTIVE.
 *  3. Notifies + emails the landlord (owner.email) when they have an active package.
 *  4. Emails when a listing is paused for an expired document (active package only).
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
    let emailsSent = 0;

    const ownerIds = [
      ...new Set(
        expiringSoon
          .map((doc) => doc.property?.ownerId)
          .filter((id): id is string => Boolean(id))
      ),
    ];

    const owners = ownerIds.length
      ? await prisma.user.findMany({
          where: { id: { in: ownerIds } },
          select: {
            id: true,
            email: true,
            firstName: true,
            roles: { select: { role: true } },
          },
        })
      : [];
    const ownerById = new Map(owners.map((o) => [o.id, o]));

    const activePackages = ownerIds.length
      ? await prisma.ownerPackage.findMany({
          where: {
            ownerId: { in: ownerIds },
            status: "ACTIVE",
            endDate: { gte: new Date() },
          },
          select: { ownerId: true },
        })
      : [];
    const ownersWithActivePackage = new Set(activePackages.map((p) => p.ownerId));

    for (const doc of expiringSoon) {
      const { property, documentType } = doc;
      if (!property || !doc.expiryDate) continue;

      const landlord = ownerById.get(property.ownerId);
      if (!landlord?.email) continue;
      if (!ownersWithActivePackage.has(property.ownerId)) continue;

      const recentWarnings = await prisma.notification.findMany({
        where: {
          userId: property.ownerId,
          type: "DOCUMENT_EXPIRY_WARNING",
          createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
        },
        select: { data: true },
      });
      const alreadyForDoc = recentWarnings.some((n) => {
        const d = n.data as { propertyId?: string; documentTypeId?: string } | null;
        return (
          d?.propertyId === property.id && d?.documentTypeId === documentType.id
        );
      });
      if (alreadyForDoc) continue;

      const documentsUrl = documentsPath(landlord.roles, property.id);
      const expiryStr = new Date(doc.expiryDate).toLocaleDateString("en-GB");

      await prisma.notification
        .create({
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
        })
        .catch(() => {
          /* non-fatal */
        });

      try {
        await emailService.sendDocumentExpiringSoonEmail({
          to: landlord.email,
          firstName: landlord.firstName,
          propertyTitle: property.title,
          documentName: documentType.name,
          expiryDate: new Date(doc.expiryDate),
          documentsUrl,
        });
        emailsSent += 1;
      } catch (err) {
        console.error(
          `[cron/expire-documents] email failed for ${landlord.email}:`,
          err
        );
      }
    }

    const recentlyInactive = await prisma.property.findMany({
      where: {
        status: "INACTIVE",
        updatedAt: { gte: new Date(Date.now() - 2 * 60 * 1000) },
      },
      select: {
        id: true,
        title: true,
        ownerId: true,
        owner: {
          select: {
            email: true,
            firstName: true,
            roles: { select: { role: true } },
          },
        },
        propertyDocuments: {
          where: { status: "EXPIRED" },
          include: { documentType: { select: { name: true } } },
          take: 1,
        },
      },
    });

    const pausedOwnerIds = [
      ...new Set(recentlyInactive.map((p) => p.ownerId)),
    ];
    const pausedPackages = pausedOwnerIds.length
      ? await prisma.ownerPackage.findMany({
          where: {
            ownerId: { in: pausedOwnerIds },
            status: "ACTIVE",
            endDate: { gte: new Date() },
          },
          select: { ownerId: true },
        })
      : [];
    const pausedWithPackage = new Set(pausedPackages.map((p) => p.ownerId));

    for (const prop of recentlyInactive) {
      if (!pausedWithPackage.has(prop.ownerId)) continue;
      const landlord = prop.owner;
      if (!landlord?.email) continue;

      const recentPaused = await prisma.notification.findMany({
        where: {
          userId: prop.ownerId,
          type: "LISTING_PAUSED",
          createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
        },
        select: { data: true },
      });
      const alreadyForProperty = recentPaused.some((n) => {
        const d = n.data as { propertyId?: string } | null;
        return d?.propertyId === prop.id;
      });
      if (alreadyForProperty) continue;

      const expiredDoc = prop.propertyDocuments[0];
      const docName = expiredDoc?.documentType?.name ?? "a required document";
      const documentsUrl = documentsPath(landlord.roles, prop.id);

      await prisma.notification
        .create({
          data: {
            userId: prop.ownerId,
            type: "LISTING_PAUSED",
            title: "Listing Paused — Expired Document",
            message: `Your listing "${prop.title}" has been paused because ${docName} has expired. Upload a new document to re-activate.`,
            data: { propertyId: prop.id },
          },
        })
        .catch(() => {
          /* non-fatal */
        });

      try {
        await emailService.sendDocumentExpiredEmail({
          to: landlord.email,
          firstName: landlord.firstName,
          propertyTitle: prop.title,
          documentName: docName,
          documentsUrl,
        });
        emailsSent += 1;
      } catch (err) {
        console.error(
          `[cron/expire-documents] expired email failed for ${landlord.email}:`,
          err
        );
      }
    }

    return successResponse(
      {
        expiredCount,
        expiringSoonCount: expiringSoon.length,
        emailsSent,
      },
      "Document expiry job completed"
    );
  } catch (err: unknown) {
    console.error("[cron/expire-documents]", err);
    return errorResponse("Internal server error", 500);
  }
}

function documentsPath(
  roles: { role: string }[],
  propertyId: string
) {
  const isAgent = roles.some((r) => r.role === "AGENT");
  if (isAgent) {
    return `/agent/dashboard/properties/${propertyId}`;
  }
  return `/owner/dashboard/properties/${propertyId}`;
}
