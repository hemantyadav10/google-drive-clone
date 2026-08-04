import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useMemo } from "react";

// ---------------------------------------------------------------------------
// Every color passes WCAG AA contrast (>= 4.5:1) against white text.
// ---------------------------------------------------------------------------

const PALETTE = [
  "#0e7490", // cyan-700
  "#4d7c0f", // lime-700
  "#e11d48", // rose-600
  "#7c3aed", // violet-600
  "#a16207", // yellow-700
  "#c026d3", // fuchsia-600
  "#047857", // emerald-700
  "#2563eb", // blue-600
  "#b45309", // amber-700
  "#db2777", // pink-600
  "#dc2626", // red-600
  "#9333ea", // purple-600
  "#0f766e", // teal-700
  "#0369a1", // sky-700
  "#15803d", // green-700
  "#4f46e5", // indigo-600
  "#c2410c", // orange-600
] as const;

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0; // force 32-bit signed int, avoids float drift on long strings
  }
  return hash >>> 0; // convert to unsigned 32-bit int
}

function getColorForSeed(seed: string): string {
  if (!seed) return PALETTE[0];
  return PALETTE[hashString(seed) % PALETTE.length];
}

function getInitials(name: string): string {
  if (!name) return "?";

  const source =
    name.includes("@") && !name.includes(" ") ? name.split("@")[0] : name;

  const parts = source.trim().split(/\s+/).filter(Boolean);

  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0][0]?.toUpperCase() ?? "?";

  const first = parts[0][0] ?? "";
  const last = parts[parts.length - 1][0] ?? "";
  return (first + last).toUpperCase();
}

const SIZE_MAP = {
  xs: 24,
  sm: 32,
  md: 40,
  lg: 56,
  xl: 96,
} as const;

type SizeToken = keyof typeof SIZE_MAP;

interface UserAvatarProps {
  /** Display name used for initials, e.g. "Hemant Yadav" or an email. */
  name: string;
  /**
   * Stable identifier for color hashing — prefer user.id over name so the
   * color doesn't shift if the user renames themselves. Falls back to `name`.
   */
  seed?: string;
  /** Optional uploaded profile image URL. */
  src?: string | null;
  size?: SizeToken | number;
  className?: string;
}

export function UserAvatar({
  name,
  seed,
  src,
  size = "md",
  className = "",
}: UserAvatarProps) {
  const px = typeof size === "number" ? size : SIZE_MAP[size];
  const seedValue = seed || name || "?";

  const { initials, bgColor } = useMemo(
    () => ({
      initials: getInitials(name),
      bgColor: getColorForSeed(seedValue),
    }),
    [name, seedValue]
  );

  const fontSize = Math.max(10, Math.round(px * 0.4));

  return (
    <Avatar
      className={`ring-1 ring-border ${className}`}
      style={{ width: px, height: px }}
    >
      {src && <AvatarImage src={src} alt={name} />}
      <AvatarFallback
        className="font-medium text-white"
        style={{ backgroundColor: bgColor, fontSize }}
      >
        {initials}
      </AvatarFallback>
    </Avatar>
  );
}

export default UserAvatar;
