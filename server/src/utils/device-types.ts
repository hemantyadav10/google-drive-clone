import type { DeviceTypes } from "ua-parser-js";
import { type DeviceType } from "../db/schema.js";

const DEVICE_TYPE_MAP: Partial<Record<DeviceTypes, DeviceType>> = {
  desktop: "desktop",
  mobile: "mobile",
  tablet: "tablet",
  console: "console",
  smarttv: "smarttv",
  wearable: "wearable",
};

export function resolveDeviceType(
  uaDeviceType: DeviceTypes | undefined,
): DeviceType {
  if (uaDeviceType === undefined) return "desktop";
  return DEVICE_TYPE_MAP[uaDeviceType] ?? "unknown";
}
