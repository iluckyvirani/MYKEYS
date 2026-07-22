import { redirect } from "next/navigation";

/** Legacy route — redirects to the new Whole Property rent flow */
export default async function LongRentRedirectPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const qs = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (typeof value === "string" && value) qs.set(key, value);
    else if (Array.isArray(value) && value[0]) qs.set(key, value[0]);
  }

  // Map old city/zip into location for the new flow
  const city = typeof params.city === "string" ? params.city : "";
  const zip = typeof params.zipCode === "string" ? params.zipCode : "";
  const location =
    (typeof params.location === "string" ? params.location : "") || zip || city;
  if (location) qs.set("location", location);

  const query = qs.toString();
  redirect(query ? `/rent/whole-property?${query}` : "/rent/whole-property");
}
