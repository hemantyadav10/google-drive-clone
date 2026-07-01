import crypto from "node:crypto";
import { logger } from "./logger.js";

type PasswordBreachResult = {
  breached: boolean;
  count?: number;
};

/**
 * Checks if a password appears in HIBP's breach database using k-anonymity
 * (only a 5-char hash prefix is sent; full comparison happens locally).
 * Fails open — returns `{ breached: false }` if the HIBP API is unreachable,
 * so an outage never blocks registration.
 */
export async function isBreachedPassword(
  password: string,
): Promise<PasswordBreachResult> {
  const hash = crypto
    .createHash("sha1")
    .update(password)
    .digest("hex")
    .toUpperCase();
  const prefix = hash.slice(0, 5);
  const suffix = hash.slice(5);
  try {
    const response = await fetch(
      `https://api.pwnedpasswords.com/range/${prefix}`,
      { signal: AbortSignal.timeout(3000), headers: { "Add-Padding": "true" } },
    );

    if (!response.ok) throw new Error(`HIBP API error: ${response.status}`);

    const text = await response.text();

    const match = text
      .split("\r\n")
      .find((line) => line.startsWith(`${suffix}:`));

    if (!match) return { breached: false };

    const count = Number(match.split(":")[1]);

    return { breached: true, count };
  } catch (error) {
    logger.warn({ err: error }, "HIBP check failed, skipping breach check");
    return { breached: false };
  }
}
