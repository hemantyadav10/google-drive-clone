import { createHash, randomBytes } from "node:crypto";

/**
 * Generates a cryptographically secure random token.
 *
 * 32 bytes = 256 bits of entropy
 * Encoded as hex => 64-character string
 */
export function generateToken(size = 32): string {
  return randomBytes(size).toString("hex");
}

export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}
