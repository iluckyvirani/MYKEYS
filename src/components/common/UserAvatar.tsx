"use client";

const SIZE_MAP = {
  xs: "w-8 h-8 text-xs",
  sm: "w-10 h-10 text-sm",
  md: "w-11 h-11 text-base",
  lg: "w-14 h-14 text-lg",
} as const;

const AVATAR_COLORS = [
  "bg-green-600",
  "bg-blue-600",
  "bg-indigo-600",
  "bg-teal-600",
  "bg-emerald-600",
];

function colorFromName(name: string) {
  const code = name.charCodeAt(0) || 65;
  return AVATAR_COLORS[code % AVATAR_COLORS.length];
}

interface UserAvatarProps {
  name: string;
  src?: string | null;
  size?: keyof typeof SIZE_MAP;
  className?: string;
  ring?: boolean;
}

export default function UserAvatar({
  name,
  src,
  size = "md",
  className = "",
  ring = false,
}: UserAvatarProps) {
  const initial = (name?.trim().charAt(0) || "?").toUpperCase();
  const sizeClass = SIZE_MAP[size];
  const ringClass = ring ? "ring-2 ring-green-400 ring-offset-1" : "";

  if (src) {
    return (
      <div
        className={`${sizeClass} rounded-full overflow-hidden shrink-0 bg-gray-100 ${ringClass} ${className}`}
      >
        <img src={src} alt={name} className="w-full h-full object-cover" />
      </div>
    );
  }

  return (
    <div
      className={`${sizeClass} rounded-full flex items-center justify-center shrink-0 font-semibold text-white ${colorFromName(name)} ${ringClass} ${className}`}
      aria-hidden
    >
      {initial}
    </div>
  );
}
