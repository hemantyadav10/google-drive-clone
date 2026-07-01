import type { NextFunction, Request, Response } from "express";
import * as z from "zod";

type RequestProperty = keyof Pick<Request, "body" | "query" | "params">;

/**
 * Creates an Express middleware that validates a request property
 * (`body`, `query`, or `params`) against a Zod schema.
 *
 * On success, the parsed and sanitized data replaces the original
 * request property. On failure, the Zod validation error is forwarded
 * to the global error handler.
 */
export function validate<K extends RequestProperty, T extends z.ZodType>(
  property: K,
  schema: T,
) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse(req[property]);

    if (!result.success) {
      next(result.error);
      return;
    }

    req[property] = result.data as Request[K];

    return next();
  };
}
