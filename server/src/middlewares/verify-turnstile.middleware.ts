import type { NextFunction, Request, Response } from "express";
import { ValidationError } from "../utils/api-error.js";
import { verifyTurnstileToken } from "../utils/turnstile.js";

export async function verifyTurnstile(
  req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> {
  const token = req.body?.turnstileToken;

  if (!token || typeof token !== "string") {
    throw new ValidationError([
      {
        code: "custom",
        path: "turnstileToken",
        message: "Verification is required.",
      },
    ]);
  }

  const isHuman = await verifyTurnstileToken(token, req.ip);

  if (!isHuman) {
    throw new ValidationError([
      {
        code: "custom",
        path: "turnstileToken",
        message: "Verification failed. Please try again.",
      },
    ]);
  }

  next();
}
