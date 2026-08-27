import type { Response } from "express";
import { ApiError } from "./api-error.js";

export function getValidatedQuery<T>(res: Response): T {
  const query = res.locals.validatedQuery;

  if (!query) {
    throw new ApiError(
      "Validated query data is missing. Ensure the query validation middleware runs before the route handler.",
    );
  }

  return query as T;
}
