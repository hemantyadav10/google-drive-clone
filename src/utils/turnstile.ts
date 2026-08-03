import { env } from "../config/env.js";
import { logger } from "./logger.js";

interface SiteverifyResponse {
  success: boolean;
  "error-codes"?: string[];
  challenge_ts?: string;
  hostname?: string;
  action?: string;
  cdata?: string;
}

export async function verifyTurnstileToken(
  token: string,
  remoteIp?: string | null,
): Promise<boolean> {
  if (!token) return false;

  try {
    const response = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          secret: env.TURNSTILE_SECRET_KEY,
          response: token,
          ...(remoteIp ? { remoteip: remoteIp } : {}),
        }),
      },
    );

    const result = (await response.json()) as SiteverifyResponse;

    if (!result.success) {
      logger.info(
        { errorCodes: result["error-codes"] },
        "Turnstile verification failed",
      );
    }

    return result.success;
  } catch (error) {
    logger.error({ err: error }, "Turnstile siteverify request failed");
    return false;
  }
}
