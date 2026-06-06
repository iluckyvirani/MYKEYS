import { prisma } from "@/lib/prisma";
import { BookingStatus, PaymentStatus } from "@prisma/client";
import {
  BlockedDateRange,
  getBlockingBookingWhere,
  parseBookingDate,
  toDateYMD,
} from "./bookingAvailability";

export async function hasDateConflict(
  propertyId: string,
  checkIn: Date,
  checkOut: Date,
  excludeBookingId?: string
): Promise<boolean> {
  const count = await prisma.booking.count({
    where: {
      ...getBlockingBookingWhere(propertyId, excludeBookingId),
      checkIn: { lt: checkOut },
      checkOut: { gt: checkIn },
    },
  });
  return count > 0;
}

export async function getBlockedDateRanges(
  propertyId: string
): Promise<BlockedDateRange[]> {
  const bookings = await prisma.booking.findMany({
    where: getBlockingBookingWhere(propertyId),
    select: { checkIn: true, checkOut: true },
    orderBy: { checkIn: "asc" },
  });

  return bookings.map((b) => ({
    checkIn: toDateYMD(parseBookingDate(b.checkIn)),
    checkOut: toDateYMD(parseBookingDate(b.checkOut)),
  }));
}

type ConfirmPaidBookingResult =
  | { ok: true }
  | { ok: false; reason: string };

/**
 * Confirm a booking after successful payment.
 * Blocks dates only when no other paid booking overlaps.
 */
export async function confirmPaidBooking(
  bookingId: string,
  paidAmount: number
): Promise<ConfirmPaidBookingResult> {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    select: {
      id: true,
      propertyId: true,
      checkIn: true,
      checkOut: true,
      status: true,
    },
  });

  if (!booking) {
    return { ok: false, reason: "Booking not found" };
  }

  if (
    booking.status === BookingStatus.CONFIRMED ||
    booking.status === BookingStatus.CHECKED_IN
  ) {
    return { ok: true };
  }

  const checkIn = parseBookingDate(booking.checkIn);
  const checkOut = parseBookingDate(booking.checkOut);
  const conflict = await hasDateConflict(
    booking.propertyId,
    checkIn,
    checkOut,
    booking.id
  );

  if (conflict) {
    await prisma.booking.update({
      where: { id: bookingId },
      data: {
        status: BookingStatus.CANCELLED,
        cancelledAt: new Date(),
        notes:
          "Auto-cancelled: dates were booked by another guest before payment completed",
      },
    });
    return { ok: false, reason: "These dates are no longer available" };
  }

  await prisma.booking.update({
    where: { id: bookingId },
    data: {
      paymentStatus: PaymentStatus.PAID,
      paidAmount,
      balanceAmount: 0,
      status: BookingStatus.CONFIRMED,
    },
  });

  return { ok: true };
}
