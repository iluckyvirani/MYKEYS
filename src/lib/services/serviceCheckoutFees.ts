export type ServiceCheckoutFees = {
  taxPercent: number;
  bookingFee: number;
  extraLabel: string;
  extraAmount: number;
};

export type SlotPeriod = "morning" | "afternoon" | "evening";

export type ServiceSlotPricing = {
  price?: number | null;
  morningSurcharge?: number | null;
  afternoonSurcharge?: number | null;
  eveningSurcharge?: number | null;
};

export type ServicePaymentSummary = {
  basePrice: number;
  slotPeriod: SlotPeriod | null;
  slotLabel: string;
  slotSurcharge: number;
  itemTotal: number;
  tax: number;
  bookingFee: number;
  extraLabel: string;
  extraAmount: number;
  taxesAndFee: number;
  tip: number;
  amountToPay: number;
};

export const SLOT_META: Record<
  SlotPeriod,
  { label: string; times: string[] }
> = {
  morning: {
    label: "Morning",
    times: ["08:00", "08:30", "09:00", "09:30", "10:00", "10:30", "11:00", "11:30"],
  },
  afternoon: {
    label: "Afternoon",
    times: ["12:00", "12:30", "13:00", "13:30", "14:00", "14:30", "15:00", "15:30", "16:00", "16:30"],
  },
  evening: {
    label: "Evening",
    times: ["17:00", "17:30", "18:00", "18:30", "19:00", "19:30", "20:00"],
  },
};

const money = (n: number) => parseFloat((Number(n) || 0).toFixed(2));

export function feesFromAdminSettings(settings: {
  serviceTaxPercent?: number | null;
  serviceBookingFee?: number | null;
  serviceExtraFeeLabel?: string | null;
  serviceExtraFeeAmount?: number | null;
} | null | undefined): ServiceCheckoutFees {
  return {
    taxPercent: money(settings?.serviceTaxPercent ?? 0),
    bookingFee: money(settings?.serviceBookingFee ?? 0),
    extraLabel: String(settings?.serviceExtraFeeLabel || "").trim(),
    extraAmount: money(settings?.serviceExtraFeeAmount ?? 0),
  };
}

export function parseSlotPeriod(value: unknown): SlotPeriod | null {
  if (value === "morning" || value === "afternoon" || value === "evening") {
    return value;
  }
  return null;
}

export function getSlotSurcharge(
  service: ServiceSlotPricing | null | undefined,
  period: SlotPeriod | null
): number {
  if (!service || !period) return 0;
  if (period === "morning") return money(service.morningSurcharge ?? 0);
  if (period === "afternoon") return money(service.afternoonSurcharge ?? 0);
  return money(service.eveningSurcharge ?? 0);
}

export function formatSlotTime(hhmm: string) {
  const [hRaw, mRaw] = hhmm.split(":");
  const h = Number(hRaw);
  const m = mRaw || "00";
  const suffix = h >= 12 ? "PM" : "AM";
  const hour12 = h % 12 || 12;
  return `${String(hour12).padStart(2, "0")}:${m} ${suffix}`;
}

export function computeServicePaymentSummary(
  itemTotal: number,
  fees: ServiceCheckoutFees,
  addons?: {
    tip?: number;
    slotSurcharge?: number;
    slotPeriod?: SlotPeriod | null;
    basePrice?: number;
  }
): ServicePaymentSummary {
  const slotSurcharge = money(addons?.slotSurcharge ?? 0);
  const basePrice = money(addons?.basePrice ?? itemTotal);
  const taxableItem = money(
    addons?.basePrice != null ? basePrice + slotSurcharge : money(itemTotal)
  );
  const tax = money((taxableItem * fees.taxPercent) / 100);
  const bookingFee = money(fees.bookingFee);
  const extraAmount = money(fees.extraAmount);
  const taxesAndFee = money(tax + bookingFee + extraAmount);
  const tip = money(addons?.tip ?? 0);
  const period = addons?.slotPeriod ?? null;
  return {
    basePrice,
    slotPeriod: period,
    slotLabel: period ? SLOT_META[period].label : "",
    slotSurcharge,
    itemTotal: taxableItem,
    tax,
    bookingFee,
    extraLabel: fees.extraLabel,
    extraAmount,
    taxesAndFee,
    tip,
    amountToPay: money(taxableItem + taxesAndFee + tip),
  };
}
