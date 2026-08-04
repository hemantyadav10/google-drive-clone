import type { Request } from "express";
import { ErrorCodes } from "../constants/error-codes.js";
import { UnauthorizedError } from "./api-error.js";

export function requireUser(req: Request): { id: string; sessionId: string } {
  if (!req.user || !req.sessionId) {
    throw new UnauthorizedError(
      "Authentication required",
      ErrorCodes.SESSION_EXPIRED,
    );
  }
  return { id: req.user.id, sessionId: req.sessionId };
}
