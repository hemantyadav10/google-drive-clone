import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDeviceLabel(
  browserName: string | null,
  osName: string | null
): string {
  if (!browserName && !osName) return "Unknown device";
  if (!browserName) return `Unknown browser on ${osName}`;
  if (!osName) return `${browserName} on unknown OS`;
  return `${browserName} on ${osName}`;
}
