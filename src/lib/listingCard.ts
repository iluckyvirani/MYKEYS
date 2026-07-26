/** Rightmove-style listing activity + agent display helpers */

function startOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

export function formatUkDayMonthYear(date: Date): string {
  const d = String(date.getDate()).padStart(2, "0");
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const y = date.getFullYear();
  return `${d}/${m}/${y}`;
}

export function formatListingActivity(opts: {
  createdAt: string | Date;
  updatedAt?: string | Date | null;
  price: number;
  originalPrice?: number | null;
}): { phrase: string; isReduced: boolean; isNewHome: boolean } {
  const created = new Date(opts.createdAt);
  const updated = opts.updatedAt ? new Date(opts.updatedAt) : created;
  const isReduced =
    typeof opts.originalPrice === "number" &&
    opts.originalPrice > 0 &&
    opts.price < opts.originalPrice;

  const eventDate = isReduced ? updated : created;
  const today = startOfDay(new Date());
  const eventDay = startOfDay(eventDate);
  const diffDays = Math.round(
    (today.getTime() - eventDay.getTime()) / (1000 * 60 * 60 * 24)
  );

  let phrase: string;
  if (diffDays <= 0) {
    phrase = isReduced ? "Reduced today" : "Added today";
  } else if (diffDays === 1) {
    phrase = isReduced ? "Reduced yesterday" : "Added yesterday";
  } else {
    phrase = `${isReduced ? "Reduced" : "Added"} on ${formatUkDayMonthYear(eventDate)}`;
  }

  const ageDays = Math.round(
    (today.getTime() - startOfDay(created).getTime()) / (1000 * 60 * 60 * 24)
  );
  const isNewHome = !isReduced && ageDays >= 0 && ageDays <= 14;

  return { phrase, isReduced, isNewHome };
}

export type ListingOwnerLike = {
  firstName?: string | null;
  lastName?: string | null;
  companyName?: string | null;
  city?: string | null;
  phone?: string | null;
  avatar?: string | null;
  agentLogo?: string | null;
  listingSellerType?: string | null;
};

export function formatListingAgentName(owner?: ListingOwnerLike | null): string {
  if (!owner) return "Private Owner";
  const isAgent = owner.listingSellerType === "AGENT";
  const fullName = [owner.firstName, owner.lastName].filter(Boolean).join(" ").trim();
  const name = isAgent
    ? owner.companyName?.trim() || fullName || "Estate Agent"
    : owner.companyName?.trim() || fullName || "Private Owner";
  const city = owner.city?.trim();
  return city ? `${name}, ${city}` : name;
}

export function resolveListingAgentLogo(
  owner?: ListingOwnerLike | null
): string | undefined {
  if (!owner) return undefined;
  if (owner.listingSellerType === "AGENT") {
    return owner.agentLogo || owner.avatar || undefined;
  }
  return owner.agentLogo || owner.avatar || undefined;
}
