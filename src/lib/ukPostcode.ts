/**
 * UK postcode helpers — normalize owner entry and user search
 * e.g. "e149rz" / "E149RZ" / "e14 9rz" → "E14 9RZ"
 */

/** Strip to A–Z / 0–9 only, uppercased */
export function compactUkPostcode(value: string): string {
  return String(value || "")
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "");
}

/**
 * Format a full or partial UK postcode for display/storage.
 * Full unit: always inserts a space before the last 3 characters.
 * Outward-only (e.g. E14, SW1A): returns uppercased compact outward.
 */
export function formatUkPostcode(value: string): string {
  const trimmed = String(value || "").trim();
  if (!trimmed) return "";

  const compact = compactUkPostcode(trimmed);

  // Full postcode unit is 5–7 chars (outward 2–4 + inward 3)
  if (compact.length >= 5 && compact.length <= 7) {
    const inward = compact.slice(-3);
    const outward = compact.slice(0, -3);
    // Inward must be digit + 2 letters for a real unit
    if (/^\d[A-Z]{2}$/.test(inward) && /^[A-Z]{1,2}\d[A-Z\d]?$/.test(outward)) {
      return `${outward} ${inward}`;
    }
  }

  // Outward-only or unknown — tidy spaces/case
  if (/^[A-Z]{1,2}\d[A-Z\d]?$/.test(compact)) {
    return compact;
  }

  return trimmed.toUpperCase().replace(/\s+/g, " ");
}

/** True when the string looks like a UK postcode (has a digit). */
export function isLikelyUkPostcode(value: string): boolean {
  const compact = compactUkPostcode(value);
  if (!compact || !/\d/.test(compact)) return false;
  return (
    /^[A-Z]{1,2}\d[A-Z\d]?\d[A-Z]{2}$/.test(compact) ||
    /^[A-Z]{1,2}\d[A-Z\d]?$/.test(compact)
  );
}

/** Outward code only — E14 9RZ → E14, SW1A 1AA → SW1A */
export function ukOutwardCode(value: string): string {
  const formatted = formatUkPostcode(value);
  const parts = formatted.split(" ");
  if (parts.length >= 2) return parts[0];
  const compact = compactUkPostcode(formatted);
  const m = compact.match(/^([A-Z]{1,2}\d{1,2}[A-Z]?)/);
  return m?.[1] || compact;
}

/**
 * Normalize a free-text location for search URLs / headings.
 * Postcodes are formatted; city names are title-trimmed only lightly.
 */
export function normalizeSearchLocation(value: string): string {
  const trimmed = String(value || "").trim();
  if (!trimmed) return "";
  if (isLikelyUkPostcode(trimmed)) return formatUkPostcode(trimmed);
  return trimmed.replace(/\s+/g, " ");
}
