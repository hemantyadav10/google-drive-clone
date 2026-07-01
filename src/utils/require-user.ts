import type { Request } from "express";
import { UnauthorizedError } from "./api-error.js";

export function requireUser(req: Request): { id: string; sessionId: string } {
  if (!req.user || !req.sessionId) {
    throw new UnauthorizedError("Authentication required");
  }
  return { id: req.user.id, sessionId: req.sessionId };
}
