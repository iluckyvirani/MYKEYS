import { prisma } from "@/lib/prisma";
import { emailService } from "@/lib/email/emailService";
import { formatCurrency } from "@/lib/utils";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function normalizeNewsletterEmail(email: string) {
  return String(email || "")
    .trim()
    .toLowerCase();
}

export async function subscribeToNewsletter(rawEmail: string) {
  const email = normalizeNewsletterEmail(rawEmail);
  if (!EMAIL_RE.test(email)) {
    throw new Error("Please enter a valid email address.");
  }

  const existing = await prisma.newsletterSubscriber.findUnique({
    where: { email },
  });

  if (existing?.isActive) {
    return { alreadySubscribed: true as const, subscriber: existing };
  }

  if (existing && !existing.isActive) {
    const subscriber = await prisma.newsletterSubscriber.update({
      where: { id: existing.id },
      data: {
        isActive: true,
        unsubscribedAt: null,
        subscribedAt: new Date(),
      },
    });
    return { alreadySubscribed: false as const, subscriber };
  }

  const subscriber = await prisma.newsletterSubscriber.create({
    data: { email },
  });
  return { alreadySubscribed: false as const, subscriber };
}

export async function unsubscribeFromNewsletter(token: string) {
  const subscriber = await prisma.newsletterSubscriber.findUnique({
    where: { unsubscribeToken: token },
  });
  if (!subscriber) return false;
  if (!subscriber.isActive) return true;

  await prisma.newsletterSubscriber.update({
    where: { id: subscriber.id },
    data: { isActive: false, unsubscribedAt: new Date() },
  });
  return true;
}

type LiveProperty = {
  id: string;
  title: string;
  city: string | null;
  address: string | null;
  price: number | null;
  propertyPrice: number | null;
  listingType: string;
  rentalType: string | null;
};

function listingLabel(p: LiveProperty) {
  if (p.listingType === "BUY") return "for sale";
  if (p.rentalType === "SHORT_TERM") return "for short stay";
  return "for rent";
}

function priceLabel(p: LiveProperty) {
  if (p.listingType === "BUY") {
    if (p.propertyPrice != null) return formatCurrency(p.propertyPrice);
    if (p.price != null) return formatCurrency(p.price);
    return "";
  }
  return p.price != null ? formatCurrency(p.price) : "";
}

/**
 * Notify active newsletter subscribers that a property just went live.
 * Fire-and-forget safe — errors are logged, never thrown to callers.
 */
export async function notifyNewsletterOfNewListing(propertyId: string) {
  try {
    const property = await prisma.property.findUnique({
      where: { id: propertyId },
      select: {
        id: true,
        title: true,
        city: true,
        address: true,
        price: true,
        propertyPrice: true,
        listingType: true,
        rentalType: true,
        status: true,
      },
    });

    if (!property || property.status !== "ACTIVE") return;

    const subscribers = await prisma.newsletterSubscriber.findMany({
      where: { isActive: true },
      select: { email: true, unsubscribeToken: true },
    });

    if (subscribers.length === 0) return;

    const payload = {
      id: property.id,
      title: property.title || property.address || "New property",
      location: [property.address, property.city].filter(Boolean).join(", "),
      priceLabel: priceLabel(property),
      listingLabel: listingLabel(property),
    };

    // Send in small batches to avoid overwhelming SMTP
    const batchSize = 10;
    for (let i = 0; i < subscribers.length; i += batchSize) {
      const batch = subscribers.slice(i, i + batchSize);
      await Promise.all(
        batch.map((sub) =>
          emailService.sendNewsletterNewListingEmail(
            sub.email,
            payload,
            sub.unsubscribeToken
          )
        )
      );
    }

    console.log(
      `[newsletter] Notified ${subscribers.length} subscriber(s) about property ${propertyId}`
    );
  } catch (err) {
    console.error("[newsletter] Failed to notify subscribers:", err);
  }
}

/** Call when a listing transitions into ACTIVE (not already live). */
export function maybeNotifyNewListing(opts: {
  previousStatus: string | null | undefined;
  nextStatus: string | null | undefined;
  propertyId: string;
}) {
  if (opts.nextStatus !== "ACTIVE") return;
  if (opts.previousStatus === "ACTIVE") return;
  void notifyNewsletterOfNewListing(opts.propertyId);
}
