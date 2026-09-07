export type AlertFrequencyValue =
  | "INSTANTLY"
  | "DAILY"
  | "EVERY_3_DAYS"
  | "EVERY_7_DAYS";

export const ALERT_FREQUENCY_OPTIONS: {
  value: AlertFrequencyValue;
  label: string;
}[] = [
  { value: "INSTANTLY", label: "Instantly" },
  { value: "DAILY", label: "Daily" },
  { value: "EVERY_3_DAYS", label: "Every 3 days" },
  { value: "EVERY_7_DAYS", label: "Every 7 days" },
];

export function buildSavedSearchName(opts: {
  listingType: string;
  rentalType?: string | null;
  location: string;
}) {
  const loc = opts.location.trim() || "your area";
  if (opts.listingType === "BUY") return `Properties For Sale in ${loc}`;
  if (opts.rentalType === "SHORT_TERM") return `Short Stays in ${loc}`;
  return `Properties To Rent in ${loc}`;
}
