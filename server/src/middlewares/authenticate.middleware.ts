import type { NextFunction, Request, Response } from "express";
import { SESSION_COOKIE_NAME } from "../config/cookies.js";
import { ErrorCodes } from "../constants/error-codes.js";
import { authService } from "../container.js";
import { UnauthorizedError } from "../utils/api-error.js";

/**
 * Validates the session cookie and populates `req.user` with the
 * authenticated user's identity for downstream handlers.
 */
export const authenticate = async (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  const sessionToken: unknown = req.cookies[SESSION_COOKIE_NAME];

  if (typeof sessionToken !== "string") {
    throw new UnauthorizedError(
      "Authentication required",
      ErrorCodes.SESSION_EXPIRED,
    );
  }

  const session = await authService.findValidSession(sessionToken);

  req.user = { id: session.userId };
  req.sessionId = session.id;

  next();
};
