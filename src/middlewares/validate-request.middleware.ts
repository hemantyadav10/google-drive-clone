import type { NextFunction, Request, Response } from "express";
import * as z from "zod";

type RequestProperty = keyof Pick<Request, "body" | "query" | "params">;

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
