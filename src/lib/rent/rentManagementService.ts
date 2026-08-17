import { Prisma, PropertyStatus, RentTenure, TenancyStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { packageService } from "@/lib/packages/packageService";
import { notificationService } from "@/lib/notifications/notificationService";
import { emailService } from "@/lib/email/emailService";
import {
  NotificationCategory,
  NotificationPriority,
  NotificationType,
} from "@/types/notification";

export type TenantDocumentInput = {
  name: string;
  fileUrl: string;
};

export type CreateTenancyInput = {
  propertyId: string;
  tenantName: string;
  tenantEmail: string;
  tenantPhone: string;
  tenure: RentTenure;
  agreementDate: string | Date;
  rentDueDay: number;
  monthlyRent?: number | null;
  documents?: TenantDocumentInput[];
};

function isLongTermRent(property: {
  listingType: string;
  rentalType: string | null;
}) {
  return property.listingType === "RENT" && property.rentalType === "LONG_TERM";
}

function isGatedListing(property: {
  listingType: string;
  rentalType: string | null;
}) {
  return (
    property.listingType === "BUY" ||
    (property.listingType === "RENT" && property.rentalType !== "SHORT_TERM")
  );
}

export function calcTenancyEndsAt(
  agreementDate: Date,
  tenure: RentTenure | string
): Date {
  const ends = new Date(agreementDate);
  const months = tenure === "SIX_MONTHS" ? 6 : 12;
  ends.setMonth(ends.getMonth() + months);
  return ends;
}

/**
 * After tenure ends: publish property if package + docs OK;
 * otherwise keep offline and email owner to restore/renew package.
 */
async function finalizeTenancyEnd(opts: {
  tenancyId: string;
  ownerId: string;
  propertyId: string;
  reason: "manual" | "tenure_finished";
}) {
  const property = await prisma.property.findFirst({
    where: { id: opts.propertyId, ownerId: opts.ownerId },
    select: {
      id: true,
      title: true,
      status: true,
      listingType: true,
      rentalType: true,
      owner: { select: { id: true, email: true, firstName: true } },
    },
  });

  if (!property) return { restored: false as const, reason: "missing" as const };

  const { getPropertyDocumentVerificationState } = await import(
    "@/lib/documents/documentService"
  );

  const publishCheck = await packageService.canPublish(opts.ownerId, {
    listingType: property.listingType,
    rentalType: property.rentalType,
  });
  let restored = false;
  let blockReason: "no_package" | "docs" | "limit" | null = null;

  if (!publishCheck.allowed) {
    blockReason = publishCheck.reason?.toLowerCase().includes("limit")
      ? "limit"
      : "no_package";
  } else {
    const docState = await getPropertyDocumentVerificationState(
      property.id,
      property.listingType,
      property.rentalType
    );
    if (!docState.canActivate) {
      blockReason = "docs";
    } else {
      await prisma.property.update({
        where: { id: property.id },
        data: { status: PropertyStatus.ACTIVE },
      });
      if (isGatedListing(property)) {
        const category =
          property.listingType === "BUY" ? "SALE" : "RENT";
        await packageService
          .incrementPropertyUsage(opts.ownerId, category)
          .catch(() => undefined);
      }
      restored = true;
    }
  }

  if (restored) {
    await notificationService
      .create({
        userId: opts.ownerId,
        type: NotificationType.PROPERTY,
        title: "Tenancy ended — listing live",
        message: `Tenure for "${property.title}" finished. Your property is live on the website again.`,
        priority: NotificationPriority.NORMAL,
        category: NotificationCategory.SUCCESS,
        actionUrl: "/owner/dashboard/properties",
        data: { propertyId: property.id, tenancyId: opts.tenancyId },
      })
      .catch(() => undefined);

    await emailService
      .sendTenancyEndedListingRestoredEmail({
        to: property.owner.email,
        firstName: property.owner.firstName,
        propertyTitle: property.title,
      })
      .catch(() => undefined);
  } else {
    const needsPackage = blockReason === "no_package" || blockReason === "limit";
    await notificationService
      .create({
        userId: opts.ownerId,
        type: NotificationType.REMINDER,
        title: needsPackage
          ? "Restore package to list property"
          : "Tenancy ended — listing not live",
        message: needsPackage
          ? `Tenure for "${property.title}" finished, but your package is expired or full. Renew/upgrade your package to make the property visible again.`
          : `Tenure for "${property.title}" finished, but documents must be verified before the listing can go live.`,
        priority: NotificationPriority.HIGH,
        category: NotificationCategory.ACTION_REQUIRED,
        actionUrl: needsPackage
          ? "/owner/dashboard/packages"
          : `/owner/dashboard/properties/${property.id}`,
        data: {
          propertyId: property.id,
          tenancyId: opts.tenancyId,
          blockReason,
        },
      })
      .catch(() => undefined);

    if (needsPackage) {
      await emailService
        .sendRestorePackageToListEmail({
          to: property.owner.email,
          firstName: property.owner.firstName,
          propertyTitle: property.title,
          reason: blockReason === "limit" ? "limit" : "expired",
        })
        .catch(() => undefined);
    }
  }

  return { restored, reason: blockReason };
}

export const rentManagementService = {
  async listOwnerTenancies(ownerId: string) {
    return prisma.propertyTenancy.findMany({
      where: { ownerId },
      include: {
        tenant: true,
        property: {
          select: {
            id: true,
            title: true,
            city: true,
            address: true,
            status: true,
            price: true,
            listingType: true,
            rentalType: true,
          },
        },
        documents: { orderBy: { createdAt: "asc" } },
      },
      orderBy: { createdAt: "desc" },
    });
  },

  async listEligibleProperties(ownerId: string) {
    const properties = await prisma.property.findMany({
      where: {
        ownerId,
        listingType: "RENT",
        rentalType: "LONG_TERM",
      },
      select: {
        id: true,
        title: true,
        city: true,
        address: true,
        status: true,
        price: true,
      },
      orderBy: { title: "asc" },
    });

    if (properties.length === 0) return [];

    const activeTenancies = await prisma.propertyTenancy.findMany({
      where: {
        ownerId,
        status: "ACTIVE",
        propertyId: { in: properties.map((p) => p.id) },
      },
      select: { propertyId: true },
    });
    const rented = new Set(activeTenancies.map((t) => t.propertyId));

    return properties.map((p) => ({
      id: p.id,
      title: p.title,
      city: p.city,
      address: p.address,
      status: p.status,
      price: p.price,
      hasActiveTenancy: rented.has(p.id),
    }));
  },

  async createTenancy(ownerId: string, input: CreateTenancyInput) {
    const property = await prisma.property.findFirst({
      where: { id: input.propertyId, ownerId },
      select: {
        id: true,
        title: true,
        status: true,
        ownerId: true,
        listingType: true,
        rentalType: true,
        price: true,
      },
    });

    if (!property) {
      throw Object.assign(new Error("Property not found"), { status: 404 });
    }

    if (!isLongTermRent(property)) {
      throw Object.assign(
        new Error("Only long-term rental properties can be managed here."),
        { status: 400 }
      );
    }

    const existingActive = await prisma.propertyTenancy.findFirst({
      where: { propertyId: property.id, status: "ACTIVE" },
      select: { id: true },
    });
    if (existingActive) {
      throw Object.assign(
        new Error("This property already has an active tenant."),
        { status: 400 }
      );
    }

    const dueDay = Number(input.rentDueDay);
    if (!Number.isInteger(dueDay) || dueDay < 1 || dueDay > 28) {
      throw Object.assign(
        new Error("Rent due day must be between 1 and 28."),
        { status: 400 }
      );
    }

    if (!["SIX_MONTHS", "TWELVE_MONTHS"].includes(input.tenure)) {
      throw Object.assign(new Error("Invalid rent tenure."), { status: 400 });
    }

    const name = input.tenantName?.trim();
    const email = input.tenantEmail?.trim().toLowerCase();
    const phone = input.tenantPhone?.trim();
    if (!name || !email || !phone) {
      throw Object.assign(
        new Error("Tenant name, email, and phone are required."),
        { status: 400 }
      );
    }

    const docs = (input.documents || []).filter(
      (d) => d.name?.trim() && d.fileUrl?.trim()
    );

    const agreementDate = new Date(input.agreementDate);
    if (Number.isNaN(agreementDate.getTime())) {
      throw Object.assign(new Error("Invalid rent agreement date."), {
        status: 400,
      });
    }

    const monthlyRent =
      input.monthlyRent != null && input.monthlyRent !== undefined
        ? Number(input.monthlyRent)
        : property.price;

    const wasActiveOnWebsite = property.status === PropertyStatus.ACTIVE;

    const tenancy = await prisma.$transaction(async (tx) => {
      const tenant = await tx.propertyTenant.create({
        data: {
          ownerId,
          name,
          email,
          phone,
        },
      });

      const created = await tx.propertyTenancy.create({
        data: {
          propertyId: property.id,
          tenantId: tenant.id,
          ownerId,
          tenure: input.tenure as RentTenure,
          agreementDate,
          endsAt: calcTenancyEndsAt(agreementDate, input.tenure),
          rentDueDay: dueDay,
          monthlyRent,
          status: TenancyStatus.ACTIVE,
          documents: docs.length
            ? {
                create: docs.map((d) => ({
                  name: d.name.trim(),
                  fileUrl: d.fileUrl.trim(),
                })),
              }
            : undefined,
        },
        include: {
          tenant: true,
          documents: true,
          property: {
            select: {
              id: true,
              title: true,
              city: true,
              status: true,
            },
          },
        },
      });

      // If listed on the website, take it offline (draft) — frees package slot
      if (wasActiveOnWebsite) {
        await tx.property.update({
          where: { id: property.id },
          data: { status: PropertyStatus.DRAFT },
        });
      }

      return created;
    });

    if (wasActiveOnWebsite && isGatedListing(property)) {
      const category =
        property.listingType === "BUY" ? "SALE" : "RENT";
      await packageService
        .decrementPropertyUsage(ownerId, category)
        .catch(() => undefined);
    }

    await notificationService
      .create({
        userId: ownerId,
        type: NotificationType.PROPERTY,
        title: "Tenant added",
        message: wasActiveOnWebsite
          ? `${name} was added for "${property.title}". The listing was moved to draft and removed from the website.`
          : `${name} was added for "${property.title}".`,
        priority: NotificationPriority.NORMAL,
        category: NotificationCategory.INFORMATIONAL,
        actionUrl: "/owner/dashboard/rent",
        data: {
          tenancyId: tenancy.id,
          propertyId: property.id,
        },
      })
      .catch(() => undefined);

    return tenancy;
  },

  async endTenancy(ownerId: string, tenancyId: string) {
    const tenancy = await prisma.propertyTenancy.findFirst({
      where: { id: tenancyId, ownerId },
      select: { id: true, status: true, propertyId: true },
    });
    if (!tenancy) {
      throw Object.assign(new Error("Tenancy not found"), { status: 404 });
    }
    if (tenancy.status !== "ACTIVE") {
      throw Object.assign(new Error("Tenancy is already ended."), {
        status: 400,
      });
    }

    const updated = await prisma.propertyTenancy.update({
      where: { id: tenancyId },
      data: { status: TenancyStatus.ENDED },
      include: {
        tenant: true,
        property: { select: { id: true, title: true, status: true } },
        documents: true,
      },
    });

    await finalizeTenancyEnd({
      tenancyId,
      ownerId,
      propertyId: tenancy.propertyId,
      reason: "manual",
    });

    return prisma.propertyTenancy.findUnique({
      where: { id: tenancyId },
      include: {
        tenant: true,
        property: { select: { id: true, title: true, status: true } },
        documents: true,
      },
    }) ?? updated;
  },

  /**
   * Daily: end tenancies past endsAt; restore listing or email to renew package.
   */
  async processExpiredTenancies(now = new Date()) {
    const expired = await prisma.propertyTenancy.findMany({
      where: {
        status: "ACTIVE",
        endsAt: { lte: now },
      },
      select: {
        id: true,
        ownerId: true,
        propertyId: true,
      },
      take: 100,
    });

    let ended = 0;
    let restored = 0;
    let needsPackage = 0;

    for (const t of expired) {
      try {
        await prisma.propertyTenancy.update({
          where: { id: t.id },
          data: { status: TenancyStatus.ENDED },
        });
        ended += 1;

        const result = await finalizeTenancyEnd({
          tenancyId: t.id,
          ownerId: t.ownerId,
          propertyId: t.propertyId,
          reason: "tenure_finished",
        });
        if (result.restored) restored += 1;
        else if (result.reason === "no_package" || result.reason === "limit") {
          needsPackage += 1;
        }
      } catch (err) {
        console.error(`Failed to end expired tenancy ${t.id}:`, err);
      }
    }

    return { ended, restored, needsPackage };
  },

  /**
   * Daily: email tenant + owner on rent due day; notify owner only.
   */
  async processRentDueReminders(now = new Date()) {
    const dueDay = Math.min(28, now.getDate());
    const reminderKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

    const dueTenancies = await prisma.propertyTenancy.findMany({
      where: {
        status: "ACTIVE",
        rentDueDay: dueDay,
        OR: [
          { lastDueReminderKey: null },
          { lastDueReminderKey: { not: reminderKey } },
        ],
      },
      include: {
        tenant: true,
        property: { select: { id: true, title: true } },
        owner: { select: { id: true, email: true, firstName: true } },
      },
    });

    let sent = 0;

    for (const t of dueTenancies) {
      const rentLabel =
        t.monthlyRent != null
          ? new Intl.NumberFormat("en-GB", {
              style: "currency",
              currency: "GBP",
            }).format(t.monthlyRent)
          : "your rent";

      try {
        await emailService.sendRentDueEmail({
          to: t.tenant.email,
          recipientName: t.tenant.name,
          propertyTitle: t.property.title,
          rentAmountLabel: rentLabel,
          dueDay: t.rentDueDay,
          role: "tenant",
        });

        await emailService.sendRentDueEmail({
          to: t.owner.email,
          recipientName: t.owner.firstName,
          propertyTitle: t.property.title,
          rentAmountLabel: rentLabel,
          dueDay: t.rentDueDay,
          role: "owner",
          tenantName: t.tenant.name,
        });

        await notificationService.create({
          userId: t.ownerId,
          type: NotificationType.REMINDER,
          title: "Rent due today",
          message: `Rent for "${t.property.title}" is due today from ${t.tenant.name} (${rentLabel}).`,
          priority: NotificationPriority.HIGH,
          category: NotificationCategory.ACTION_REQUIRED,
          actionUrl: "/owner/dashboard/rent",
          data: {
            tenancyId: t.id,
            propertyId: t.propertyId,
            tenantId: t.tenantId,
          },
        });

        await prisma.propertyTenancy.update({
          where: { id: t.id },
          data: { lastDueReminderKey: reminderKey },
        });

        sent += 1;
      } catch (err) {
        console.error(`Rent due reminder failed for tenancy ${t.id}:`, err);
      }
    }

    return { checked: dueTenancies.length, sent };
  },
};

export type OwnerTenancyListItem = Prisma.PropertyTenancyGetPayload<{
  include: {
    tenant: true;
    property: {
      select: {
        id: true;
        title: true;
        city: true;
        address: true;
        status: true;
        price: true;
        listingType: true;
        rentalType: true;
      };
    };
    documents: true;
  };
}>;
