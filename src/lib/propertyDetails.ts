/** Shared options + helpers for Rightmove-style property detail fields */

export const FURNISH_TYPE_OPTIONS = [
  { value: "", label: "Ask agent / not set" },
  { value: "UNFURNISHED", label: "Unfurnished" },
  { value: "PART_FURNISHED", label: "Part furnished" },
  { value: "FURNISHED", label: "Furnished" },
];

export const GARDEN_OPTIONS = [
  { value: "", label: "Ask agent / not set" },
  { value: "NONE", label: "No garden" },
  { value: "PRIVATE", label: "Private garden" },
  { value: "SHARED", label: "Shared garden" },
  { value: "COMMUNAL", label: "Communal garden" },
  { value: "YES", label: "Yes" },
];

export const PARKING_TYPE_OPTIONS = [
  { value: "", label: "Ask agent / not set" },
  { value: "NONE", label: "No parking" },
  { value: "ON_STREET", label: "On street" },
  { value: "PERMIT", label: "Permit" },
  { value: "ALLOCATED", label: "Allocated" },
  { value: "GARAGE", label: "Garage" },
  { value: "DRIVEWAY", label: "Driveway" },
];

export const EPC_BAND_OPTIONS = [
  { value: "", label: "Not set" },
  ..."ABCDEFG".split("").map((b) => ({ value: b, label: `Band ${b}` })),
];

export const COUNCIL_TAX_OPTIONS = [
  { value: "", label: "Ask agent / not set" },
  ..."ABCDEFGH".split("").map((b) => ({ value: b, label: `Band ${b}` })),
];

export type PropertyUtilities = {
  electricity?: string;
  water?: string;
  heating?: string;
  broadband?: string;
  sewerage?: string;
  privateRightOfWay?: string;
  publicRightOfWay?: string;
  listedProperty?: string;
  restrictions?: string;
  floodedLast5Years?: string;
  floodDefenses?: string;
  floodSource?: string;
};

export const EMPTY_UTILITIES: PropertyUtilities = {
  electricity: "",
  water: "",
  heating: "",
  broadband: "",
  sewerage: "",
  privateRightOfWay: "",
  publicRightOfWay: "",
  listedProperty: "",
  restrictions: "",
  floodedLast5Years: "",
  floodDefenses: "",
  floodSource: "",
};

export function labelOrAsk(value?: string | null, map?: Record<string, string>) {
  if (!value || !String(value).trim()) return "Ask agent";
  if (map && map[value]) return map[value];
  return value;
}

export const FURNISH_LABELS: Record<string, string> = {
  UNFURNISHED: "Unfurnished",
  PART_FURNISHED: "Part furnished",
  FURNISHED: "Furnished",
};

export const GARDEN_LABELS: Record<string, string> = {
  NONE: "No",
  PRIVATE: "Private",
  SHARED: "Shared",
  COMMUNAL: "Communal",
  YES: "Yes",
  ASK: "Ask agent",
};

export const PARKING_LABELS: Record<string, string> = {
  NONE: "No parking",
  ON_STREET: "On street",
  PERMIT: "Permit",
  ALLOCATED: "Allocated",
  GARAGE: "Garage",
  DRIVEWAY: "Driveway",
  ASK: "Ask agent",
};

export function formatWeeklyFromMonthly(amount: number) {
  if (!amount) return "";
  return `£${Math.round((amount * 12) / 52).toLocaleString()} pw`;
}

export function formatUkDate(date?: string | Date | null) {
  if (!date) return "Ask agent";
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return "Ask agent";
  return d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export function parseKeyFeaturesInput(raw: string): string[] {
  return raw
    .split(/\n|,/)
    .map((s) => s.trim())
    .filter(Boolean);
}
