export type ProfileRole = "user" | "owner" | "service";

export type ProfileCompletionItem = {
  key: string;
  label: string;
  filled: boolean;
};

export type ProfileCompletionResult = {
  percent: number;
  filled: number;
  total: number;
  items: ProfileCompletionItem[];
  missing: ProfileCompletionItem[];
  isComplete: boolean;
};

function filled(value: unknown): boolean {
  if (value == null) return false;
  if (typeof value === "string") return value.trim().length > 0;
  if (Array.isArray(value)) return value.length > 0;
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return Number.isFinite(value);
  return Boolean(value);
}

function score(items: ProfileCompletionItem[]): ProfileCompletionResult {
  const total = items.length || 1;
  const filledCount = items.filter((i) => i.filled).length;
  const percent = Math.round((filledCount / total) * 100);
  return {
    percent,
    filled: filledCount,
    total: items.length,
    items,
    missing: items.filter((i) => !i.filled),
    isComplete: filledCount === items.length && items.length > 0,
  };
}

/** Tenant / USER profile completeness from /auth/me */
export function getUserProfileCompletion(user: Record<string, any> | null | undefined) {
  const u = user || {};
  return score([
    { key: "firstName", label: "First name", filled: filled(u.firstName) },
    { key: "lastName", label: "Last name", filled: filled(u.lastName) },
    { key: "phone", label: "Phone number", filled: filled(u.phone) },
    { key: "avatar", label: "Profile photo", filled: filled(u.avatar) },
    { key: "birthDate", label: "Date of birth", filled: filled(u.birthDate) },
    { key: "gender", label: "Gender", filled: filled(u.gender) },
    { key: "address", label: "Address", filled: filled(u.address) },
    { key: "city", label: "City", filled: filled(u.city) },
    {
      key: "location",
      label: "State / country / postcode",
      filled: filled(u.state) && filled(u.country) && filled(u.zipCode),
    },
    {
      key: "emergency",
      label: "Emergency contact",
      filled: filled(u.emergencyName) && filled(u.emergencyContact),
    },
  ]);
}

/** OWNER profile completeness from /auth/me */
export function getOwnerProfileCompletion(user: Record<string, any> | null | undefined) {
  const u = user || {};
  const isAgent = String(u.listingSellerType || "").toUpperCase() === "AGENT";

  const items: ProfileCompletionItem[] = [
    { key: "firstName", label: "First name", filled: filled(u.firstName) },
    { key: "lastName", label: "Last name", filled: filled(u.lastName) },
    { key: "phone", label: "Phone number", filled: filled(u.phone) },
    { key: "avatar", label: "Profile photo", filled: filled(u.avatar) },
    { key: "city", label: "City", filled: filled(u.city) },
    {
      key: "listingSellerType",
      label: "Listing type (Agent / Owner)",
      filled: filled(u.listingSellerType),
    },
  ];

  if (isAgent) {
    items.push(
      { key: "companyName", label: "Agency / company name", filled: filled(u.companyName) },
      { key: "agentLogo", label: "Agency logo", filled: filled(u.agentLogo) }
    );
  } else {
    items.push({
      key: "companyName",
      label: "Company name (optional)",
      filled: filled(u.companyName) || filled(u.listingSellerType),
    });
  }

  items.push(
    { key: "address", label: "Address", filled: filled(u.address) },
    {
      key: "location",
      label: "State / country / postcode",
      filled: filled(u.state) && filled(u.country) && filled(u.zipCode),
    }
  );

  return score(items);
}

/** SERVICE profile completeness from /service/profile (+ optional auth user) */
export function getServiceProfileCompletion(
  profile: Record<string, any> | null | undefined
) {
  const p = profile || {};
  const name =
    p.name ||
    [p.firstName, p.lastName].filter(Boolean).join(" ").trim();

  return score([
    { key: "name", label: "Full name", filled: filled(name) },
    { key: "phone", label: "Phone number", filled: filled(p.phone) },
    { key: "avatar", label: "Profile photo", filled: filled(p.avatar) },
    { key: "city", label: "City", filled: filled(p.city) },
    { key: "state", label: "State / region", filled: filled(p.state) },
    { key: "bio", label: "Bio", filled: filled(p.bio) },
    {
      key: "categories",
      label: "Service categories",
      filled: filled(p.categories) || filled(p.category),
    },
    {
      key: "serviceAreas",
      label: "Service areas",
      filled: filled(p.serviceAreas),
    },
    {
      key: "skills",
      label: "Specializations or certifications",
      filled: filled(p.specializations) || filled(p.certifications),
    },
  ]);
}

export function getProfileHref(role: ProfileRole): string {
  if (role === "owner") return "/owner/dashboard/profile";
  if (role === "service") return "/service/dashboard/profile";
  return "/user/dashboard/profile";
}
