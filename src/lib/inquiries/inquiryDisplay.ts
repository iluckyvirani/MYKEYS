import { formatGenderLabel } from "@/lib/user/profileFields";

/** Parse birthDate from YYYY-MM-DD, ISO datetime, or DD/MM/YYYY */
export function parseBirthDate(birthDate: string | null | undefined): Date | null {
  if (!birthDate?.trim()) return null;

  const value = birthDate.trim();

  const isoMatch = value.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (isoMatch) {
    const born = new Date(
      Number(isoMatch[1]),
      Number(isoMatch[2]) - 1,
      Number(isoMatch[3])
    );
    return Number.isNaN(born.getTime()) ? null : born;
  }

  const ukMatch = value.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (ukMatch) {
    const born = new Date(
      Number(ukMatch[3]),
      Number(ukMatch[2]) - 1,
      Number(ukMatch[1])
    );
    return Number.isNaN(born.getTime()) ? null : born;
  }

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export function calculateAge(birthDate: string | null | undefined): number | null {
  const born = parseBirthDate(birthDate);
  if (!born) return null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  born.setHours(0, 0, 0, 0);

  if (born > today) return null;

  let age = today.getFullYear() - born.getFullYear();
  const monthDiff = today.getMonth() - born.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < born.getDate())) {
    age -= 1;
  }
  return age >= 0 ? age : null;
}

/** Human-readable age for inquiry UI */
export function formatAgeDisplay(birthDate: string | null | undefined): string {
  if (!birthDate?.trim()) return "—";
  const born = parseBirthDate(birthDate);
  if (!born) return "—";

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  born.setHours(0, 0, 0, 0);

  if (born > today) return "—";

  const age = calculateAge(birthDate);
  if (age === null) return "—";
  if (age === 0) return "Under 1 year";
  return String(age);
}

export function formatBirthDate(birthDate: string | null | undefined): string {
  if (!birthDate) return "—";
  const d = new Date(birthDate);
  if (Number.isNaN(d.getTime())) return birthDate;
  return d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function formatLastActive(lastLoginAt: string | null | undefined): string {
  if (!lastLoginAt) return "Unknown";
  const diff = Date.now() - new Date(lastLoginAt).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days}d ago`;
  return new Date(lastLoginAt).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function formatMemberSince(createdAt: string | null | undefined): string {
  if (!createdAt) return "—";
  return new Date(createdAt).getFullYear().toString();
}

export function formatMemberSinceFull(createdAt: string | null | undefined): string {
  if (!createdAt) return "Not specified";
  return new Date(createdAt).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function formatGender(gender: string | null | undefined): string {
  return formatGenderLabel(gender);
}

export function formatChatTimestamp(dateStr: string): string {
  const d = new Date(dateStr);
  const now = new Date();
  const isToday = d.toDateString() === now.toDateString();
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const isYesterday = d.toDateString() === yesterday.toDateString();
  const time = d.toLocaleTimeString("en-GB", { hour: "numeric", minute: "2-digit" });
  if (isToday) return `Today ${time}`;
  if (isYesterday) return `Yesterday ${time}`;
  return (
    d.toLocaleDateString("en-GB", { day: "numeric", month: "short" }) + ` ${time}`
  );
}

export function timeAgoShort(dateStr: string | null | undefined): string {
  if (!dateStr) return "";
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}
