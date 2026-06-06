export const GENDER_OPTIONS = [
  { value: "MALE", label: "Male" },
  { value: "FEMALE", label: "Female" },
  { value: "OTHER", label: "Other" },
  { value: "PREFER_NOT_TO_SAY", label: "Prefer not to say" },
] as const;

export type GenderValue = (typeof GENDER_OPTIONS)[number]["value"];

export function formatGenderLabel(gender: string | null | undefined): string {
  if (!gender) return "—";
  const match = GENDER_OPTIONS.find((o) => o.value === gender);
  return match?.label ?? gender.replace(/_/g, " ").toLowerCase().replace(/^\w/, (c) => c.toUpperCase());
}

/** Tenant/guest profile fields sourced from the User model */
export interface GuestProfile {
  birthDate: string | null;
  gender: string | null;
  avatar: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  address: string | null;
  createdAt: string | null;
  lastLoginAt: string | null;
}

export function mapUserToGuestProfile(user: {
  birthDate?: string | null;
  gender?: string | null;
  avatar?: string | null;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  address?: string | null;
  createdAt?: Date | string;
  lastLoginAt?: Date | string | null;
} | null | undefined): GuestProfile | null {
  if (!user) return null;
  return {
    birthDate: user.birthDate ?? null,
    gender: user.gender ?? null,
    avatar: user.avatar ?? null,
    city: user.city ?? null,
    state: user.state ?? null,
    country: user.country ?? null,
    address: user.address ?? null,
    createdAt: user.createdAt
      ? typeof user.createdAt === "string"
        ? user.createdAt
        : user.createdAt.toISOString()
      : null,
    lastLoginAt: user.lastLoginAt
      ? typeof user.lastLoginAt === "string"
        ? user.lastLoginAt
        : user.lastLoginAt.toISOString()
      : null,
  };
}
