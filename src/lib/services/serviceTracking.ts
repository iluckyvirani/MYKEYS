import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export type TrackingPoint = { lat: number; lng: number };

export type TrackingSnapshot = {
  bookingId: string;
  status: string;
  trackingActive: boolean;
  location: string | null;
  destination: TrackingPoint | null;
  provider: (TrackingPoint & { updatedAt: string }) | null;
  enRouteAt: string | null;
  serviceName: string;
  providerName: string;
};

type TrackingRow = {
  id: string;
  status: string;
  location: string | null;
  service: string;
  clientId: string;
  providerId: string;
  destinationLat: number | null;
  destinationLng: number | null;
  providerLat: number | null;
  providerLng: number | null;
  providerLocationUpdatedAt: Date | null;
  trackingActive: boolean;
  enRouteAt: Date | null;
};

function moneyCoord(value: unknown): number | null {
  const n = Number(value);
  if (!Number.isFinite(n)) return null;
  if (n < -90 || n > 180) return null;
  return parseFloat(n.toFixed(6));
}

function isLatLng(lat: unknown, lng: unknown): lat is number {
  const a = Number(lat);
  const b = Number(lng);
  return Number.isFinite(a) && Number.isFinite(b) && a >= -90 && a <= 90 && b >= -180 && b <= 180;
}

export function frontendBookingStatus(status: string) {
  return String(status || "").toLowerCase().replace(/_/g, "-");
}

export function isLiveTrackingStatus(status: string) {
  const s = frontendBookingStatus(status);
  return s === "on-the-way" || s === "in-progress";
}

async function loadRow(id: string): Promise<TrackingRow | null> {
  try {
    const rows = await prisma.$queryRaw<TrackingRow[]>`
      SELECT
        id, status, location, service, "clientId", "providerId",
        "destinationLat", "destinationLng",
        "providerLat", "providerLng", "providerLocationUpdatedAt",
        "trackingActive", "enRouteAt"
      FROM "ServiceBooking"
      WHERE id = ${id}
      LIMIT 1
    `;
    return rows[0] || null;
  } catch (err) {
    console.warn("Tracking load failed:", err);
    const booking = await prisma.serviceBooking.findUnique({
      where: { id },
      select: {
        id: true,
        status: true,
        location: true,
        service: true,
        clientId: true,
        providerId: true,
      },
    });
    if (!booking) return null;
    return {
      ...booking,
      destinationLat: null,
      destinationLng: null,
      providerLat: null,
      providerLng: null,
      providerLocationUpdatedAt: null,
      trackingActive: false,
      enRouteAt: null,
    };
  }
}

async function geocodeAddress(address: string): Promise<TrackingPoint | null> {
  const key = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";
  if (!key || key.includes("your-google") || !address.trim()) return null;
  try {
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
      address
    )}&key=${key}`;
    const res = await fetch(url);
    const data = (await res.json()) as {
      results?: { geometry?: { location?: { lat: number; lng: number } } }[];
    };
    const loc = data.results?.[0]?.geometry?.location;
    if (!loc || !isLatLng(loc.lat, loc.lng)) return null;
    return { lat: loc.lat, lng: loc.lng };
  } catch {
    return null;
  }
}

async function persistDestination(id: string, dest: TrackingPoint) {
  await prisma.$executeRaw`
    UPDATE "ServiceBooking"
    SET "destinationLat" = ${dest.lat}, "destinationLng" = ${dest.lng}
    WHERE id = ${id}
  `;
}

export async function persistBookingDestination(
  id: string,
  lat?: number | null,
  lng?: number | null
) {
  if (!isLatLng(lat, lng)) return;
  await persistDestination(id, { lat: Number(lat), lng: Number(lng) });
}

function toSnapshot(
  row: TrackingRow,
  extras?: { providerName?: string }
): TrackingSnapshot {
  const destLat = moneyCoord(row.destinationLat);
  const destLng = moneyCoord(row.destinationLng);
  const provLat = moneyCoord(row.providerLat);
  const provLng = moneyCoord(row.providerLng);
  return {
    bookingId: row.id,
    status: frontendBookingStatus(row.status),
    trackingActive: Boolean(row.trackingActive),
    location: row.location,
    destination: destLat != null && destLng != null ? { lat: destLat, lng: destLng } : null,
    provider:
      provLat != null && provLng != null
        ? {
            lat: provLat,
            lng: provLng,
            updatedAt: row.providerLocationUpdatedAt
              ? new Date(row.providerLocationUpdatedAt).toISOString()
              : new Date().toISOString(),
          }
        : null,
    enRouteAt: row.enRouteAt ? new Date(row.enRouteAt).toISOString() : null,
    serviceName: row.service,
    providerName: extras?.providerName || "Professional",
  };
}

export async function getTrackingSnapshot(
  bookingId: string,
  actor: { userId: string; providerId?: string | null }
): Promise<TrackingSnapshot> {
  const row = await loadRow(bookingId);
  if (!row) throw new Error("Booking not found");

  const provider = await prisma.serviceProvider.findUnique({
    where: { id: row.providerId },
    include: { user: { select: { firstName: true, lastName: true } } },
  });
  const isClient = row.clientId === actor.userId;
  const isProvider = Boolean(actor.providerId && actor.providerId === row.providerId);
  if (!isClient && !isProvider) throw new Error("Unauthorized");

  return toSnapshot(row, {
    providerName: provider
      ? `${provider.user.firstName} ${provider.user.lastName}`.trim()
      : "Professional",
  });
}

function serviceBookingsPath(roles: string[]) {
  if (roles.includes("OWNER")) return "/owner/dashboard/service-bookings";
  if (roles.includes("AGENT")) return "/agent/dashboard/service-bookings";
  return "/user/dashboard/service-bookings";
}

async function notifyClientProfessionalOnTheWay(bookingId: string) {
  const booking = await prisma.serviceBooking.findUnique({
    where: { id: bookingId },
    include: {
      client: {
        select: {
          id: true,
          email: true,
          firstName: true,
          roles: { select: { role: true } },
        },
      },
      provider: { include: { user: { select: { firstName: true, lastName: true } } } },
    },
  });
  if (!booking?.client) return;

  const providerName =
    `${booking.provider.user.firstName} ${booking.provider.user.lastName}`.trim() ||
    "Your professional";
  const roles = (booking.client.roles || []).map((r) => String(r.role));
  const actionUrl = serviceBookingsPath(roles);
  const { getAppBaseUrl } = await import("@/lib/email/emailLayout");
  const trackUrl = `${getAppBaseUrl()}${actionUrl}`;
  const scheduledDate = booking.scheduledDate
    ? booking.scheduledDate.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : null;

  try {
    const { notificationService } = await import("@/lib/notifications/notificationService");
    const { NotificationType, NotificationPriority, NotificationCategory } = await import(
      "@/types/notification"
    );
    await notificationService.create({
      userId: booking.client.id,
      type: NotificationType.BOOKING,
      title: "Professional is on the way",
      message: `${providerName} has left and is sharing live location for "${booking.service}". Open Service Bookings to track them on the map.`,
      priority: NotificationPriority.HIGH,
      category: NotificationCategory.INFORMATIONAL,
      actionUrl,
      data: { serviceBookingId: bookingId, tracking: true },
    });
  } catch (err) {
    console.warn("On-the-way dashboard notification failed:", err);
  }

  try {
    const { emailService } = await import("@/lib/email/emailService");
    await emailService.sendServiceOnTheWayEmail({
      to: booking.client.email,
      firstName: booking.client.firstName,
      serviceName: booking.service,
      providerName,
      location: booking.location,
      scheduledDate,
      scheduledTime: booking.scheduledTime,
      trackUrl,
    });
  } catch (err) {
    console.warn("On-the-way email failed:", err);
  }
}

export async function startEnRoute(
  bookingId: string,
  providerId: string,
  point: TrackingPoint,
  destination?: TrackingPoint | null
): Promise<TrackingSnapshot> {
  const row = await loadRow(bookingId);
  if (!row) throw new Error("Booking not found");
  if (row.providerId !== providerId) throw new Error("Unauthorized");
  const status = String(row.status);
  if (status === "COMPLETED" || status === "CANCELLED" || status === "PENDING") {
    throw new Error("Accept the booking first, then share your live location");
  }
  if (!isLatLng(point.lat, point.lng)) {
    throw new Error("A valid live location is required");
  }

  let dest = destination && isLatLng(destination.lat, destination.lng) ? destination : null;
  if (!dest && isLatLng(row.destinationLat, row.destinationLng)) {
    dest = { lat: Number(row.destinationLat), lng: Number(row.destinationLng) };
  }
  if (!dest && row.location) {
    dest = await geocodeAddress(row.location);
  }

  const now = new Date();
  await prisma.$executeRaw`
    UPDATE "ServiceBooking"
    SET
      status = 'ON_THE_WAY'::"ServiceBookingStatus",
      "trackingActive" = true,
      "enRouteAt" = COALESCE("enRouteAt", ${now}),
      "providerLat" = ${point.lat},
      "providerLng" = ${point.lng},
      "providerLocationUpdatedAt" = ${now}
    WHERE id = ${bookingId}
  `;
  if (dest) await persistDestination(bookingId, dest);

  const firstLeave = !row.enRouteAt;
  if (firstLeave) {
    await notifyClientProfessionalOnTheWay(bookingId);
  }

  return getTrackingSnapshot(bookingId, { userId: "", providerId });
}

export async function pingProviderLocation(
  bookingId: string,
  providerId: string,
  point: TrackingPoint
): Promise<TrackingSnapshot> {
  const row = await loadRow(bookingId);
  if (!row) throw new Error("Booking not found");
  if (row.providerId !== providerId) throw new Error("Unauthorized");
  if (!row.trackingActive && !isLiveTrackingStatus(row.status)) {
    throw new Error("Live tracking is not active for this booking");
  }
  if (!isLatLng(point.lat, point.lng)) {
    throw new Error("A valid live location is required");
  }

  const now = new Date();
  await prisma.$executeRaw`
    UPDATE "ServiceBooking"
    SET
      "providerLat" = ${point.lat},
      "providerLng" = ${point.lng},
      "providerLocationUpdatedAt" = ${now},
      "trackingActive" = true
    WHERE id = ${bookingId}
  `;

  return getTrackingSnapshot(bookingId, { userId: "", providerId });
}

export async function stopTracking(bookingId: string) {
  try {
    await prisma.$executeRaw`
      UPDATE "ServiceBooking"
      SET "trackingActive" = false
      WHERE id = ${bookingId}
    `;
  } catch (err) {
    console.warn("Could not stop tracking:", err);
  }
}

export async function attachTrackingToBookings<T extends { id: string }>(
  rows: T[]
): Promise<
  (T & {
    trackingActive: boolean;
    destinationLat: number | null;
    destinationLng: number | null;
    providerLat: number | null;
    providerLng: number | null;
    providerLocationUpdatedAt: string | null;
  })[]
> {
  if (rows.length === 0) return [];
  const ids = rows.map((row) => row.id);
  const extras = new Map<
    string,
    {
      trackingActive: boolean;
      destinationLat: number | null;
      destinationLng: number | null;
      providerLat: number | null;
      providerLng: number | null;
      providerLocationUpdatedAt: string | null;
    }
  >();
  try {
    const found = await prisma.$queryRaw<
      {
        id: string;
        trackingActive: boolean;
        destinationLat: number | null;
        destinationLng: number | null;
        providerLat: number | null;
        providerLng: number | null;
        providerLocationUpdatedAt: Date | null;
      }[]
    >`
      SELECT id, "trackingActive", "destinationLat", "destinationLng",
             "providerLat", "providerLng", "providerLocationUpdatedAt"
      FROM "ServiceBooking"
      WHERE id IN (${Prisma.join(ids)})
    `;
    // Prisma.join with dynamic array — handle below if this path is awkward
    for (const row of found) {
      extras.set(row.id, {
        trackingActive: Boolean(row.trackingActive),
        destinationLat: moneyCoord(row.destinationLat),
        destinationLng: moneyCoord(row.destinationLng),
        providerLat: moneyCoord(row.providerLat),
        providerLng: moneyCoord(row.providerLng),
        providerLocationUpdatedAt: row.providerLocationUpdatedAt
          ? new Date(row.providerLocationUpdatedAt).toISOString()
          : null,
      });
    }
  } catch (err) {
    console.warn("attachTrackingToBookings failed:", err);
  }

  return rows.map((row) => ({
    ...row,
    trackingActive: extras.get(row.id)?.trackingActive ?? false,
    destinationLat: extras.get(row.id)?.destinationLat ?? null,
    destinationLng: extras.get(row.id)?.destinationLng ?? null,
    providerLat: extras.get(row.id)?.providerLat ?? null,
    providerLng: extras.get(row.id)?.providerLng ?? null,
    providerLocationUpdatedAt: extras.get(row.id)?.providerLocationUpdatedAt ?? null,
  }));
}
