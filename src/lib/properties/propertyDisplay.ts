/** Listing badge + price label helpers shared across admin/owner dashboards */

export function getListingBadgeConfig(
  listingType?: string | null,
  rentalType?: string | null
) {
  const lt = (listingType || "").toUpperCase();
  const rt = (rentalType || "").toUpperCase();

  if (lt === "BUY") {
    return { text: "For Sale", variant: "buy" as const };
  }
  if (rt === "SHORT_TERM") {
    return { text: "Short Stay", variant: "short" as const };
  }
  if (rt === "LONG_TERM") {
    return { text: "Long Rent", variant: "long" as const };
  }
  return { text: "For Rent", variant: "rent" as const };
}

export function getPropertyPriceDisplay(property: {
  listingType?: string | null;
  rentalType?: string | null;
  priceType?: string | null;
  price?: number | null;
  propertyPrice?: number | null;
}) {
  const listing = (property.listingType || "").toUpperCase();
  const rental = (property.rentalType || "").toUpperCase();
  const priceType = (property.priceType || "").toUpperCase();

  if (listing === "BUY") {
    return {
      amount: property.propertyPrice ?? property.price ?? 0,
      suffix: " total",
    };
  }

  if (priceType === "MONTHLY" || rental === "LONG_TERM") {
    return { amount: property.price ?? 0, suffix: "/month" };
  }

  if (priceType === "TOTAL") {
    return { amount: property.price ?? 0, suffix: " total" };
  }

  return { amount: property.price ?? 0, suffix: "/night" };
}
