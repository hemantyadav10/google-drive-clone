import { hash, verify } from "argon2";
import { logger } from "./logger.js";

export function hashPassword(plainTextPassword: string): Promise<string> {
  return hash(plainTextPassword);
}

export async function comparePassword(
  storedHash: string,
  plainTextPassword: string,
): Promise<boolean> {
  try {
    return await verify(storedHash, plainTextPassword);
  } catch (error) {
    logger.warn(
      { err: error },
      "Password verification threw an unexpected error",
    );
    return false;
  }
}
