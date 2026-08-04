import { UAParser } from "ua-parser-js";

export function parseUserAgent(userAgent: string) {
  return UAParser(userAgent);
}
