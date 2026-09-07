/** Shared Google Maps API key check for client components */
export const GOOGLE_MAPS_API_KEY =
  process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? "";

export function hasGoogleMapsApiKey(key: string = GOOGLE_MAPS_API_KEY): boolean {
  return (
    Boolean(key) &&
    !key.includes("your-google") &&
    key.trim().length > 20
  );
}
