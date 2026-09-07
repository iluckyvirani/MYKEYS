import { BookingStatus, PaymentStatus } from "@prisma/client";

/** Bookings that block the calendar (paid + active stay lifecycle) */
export const DATE_BLOCKING_BOOKING_STATUSES: BookingStatus[] = [
  BookingStatus.CONFIRMED,
  BookingStatus.CHECKED_IN,
  BookingStatus.CHECKED_OUT,
];

export type BlockedDateRange = {
  checkIn: string;
  checkOut: string;
};

export function parseBookingDate(dateInput: string | Date): Date {
  if (dateInput instanceof Date) {
    const d = new Date(dateInput);
    d.setHours(0, 0, 0, 0);
    return d;
  }
  const isoMatch = dateInput.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (isoMatch) {
    return new Date(
      Number(isoMatch[1]),
      Number(isoMatch[2]) - 1,
      Number(isoMatch[3])
    );
  }
  const d = new Date(dateInput);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function toDateYMD(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/** Hotel-style: occupied nights are [checkIn, checkOut) — checkout day is free. */
export function rangesOverlap(
  checkInA: Date,
  checkOutA: Date,
  checkInB: Date,
  checkOutB: Date
): boolean {
  return checkInA < checkOutB && checkOutA > checkInB;
}

export function getBlockingBookingWhere(
  propertyId: string,
  excludeBookingId?: string
) {
  return {
    propertyId,
    ...(excludeBookingId ? { id: { not: excludeBookingId } } : {}),
    status: { in: DATE_BLOCKING_BOOKING_STATUSES },
    paymentStatus: PaymentStatus.PAID,
  };
}

/** True if this calendar night is occupied (checkIn <= date < checkOut). */
export function isDateBlocked(
  dateYMD: string,
  blockedRanges: BlockedDateRange[]
): boolean {
  for (const range of blockedRanges) {
    if (dateYMD >= range.checkIn && dateYMD < range.checkOut) {
      return true;
    }
  }
  return false;
}

/** True if entire stay [checkIn, checkOut) is free. */
export function isRangeAvailable(
  checkIn: string,
  checkOut: string,
  blockedRanges: BlockedDateRange[]
): boolean {
  const start = parseBookingDate(checkIn);
  const end = parseBookingDate(checkOut);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end <= start) {
    return false;
  }

  for (const range of blockedRanges) {
    const rangeStart = parseBookingDate(range.checkIn);
    const rangeEnd = parseBookingDate(range.checkOut);
    if (rangesOverlap(start, end, rangeStart, rangeEnd)) {
      return false;
    }
  }
  return true;
}

export function canSelectCheckIn(
  dateYMD: string,
  blockedRanges: BlockedDateRange[]
): boolean {
  return !isDateBlocked(dateYMD, blockedRanges);
}

export function canSelectCheckOut(
  checkIn: string,
  checkOutYMD: string,
  blockedRanges: BlockedDateRange[]
): boolean {
  if (!checkIn || !checkOutYMD || checkOutYMD <= checkIn) return false;
  return isRangeAvailable(checkIn, checkOutYMD, blockedRanges);
}
