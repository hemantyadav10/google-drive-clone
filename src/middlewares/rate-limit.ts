import type { NextFunction, Request, Response } from "express";
import { RateLimiterRedis, RateLimiterRes } from "rate-limiter-flexible";
import { env } from "../config/env.js";
import { redis } from "../config/redis.js";
import { TooManyRequestsError } from "../utils/api-error.js";
import { formatRetryAfter } from "../utils/helper.js";
import { logger } from "../utils/logger.js";

interface RateLimitOptions {
  keyPrefix: string;
  points: number;
  duration: number;
  keyGenerator?: (req: Request) => string;
  blockDuration?: number;
}

export function createRateLimiter({
  keyPrefix,
  points,
  duration,
  keyGenerator = (req) => req.ip ?? "unknown",
  blockDuration,
}: RateLimitOptions) {
  const limiter = new RateLimiterRedis({
    storeClient: redis,
    keyPrefix,
    points,
    duration,
    blockDuration: blockDuration ?? duration,
  });

  return async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    if (env.NODE_ENV === "development" && !env.RATE_LIMIT_ENABLED_IN_DEV) {
      next();
      return;
    }

    try {
      const key = keyGenerator(req);
      const rateLimiterRes = await limiter.consume(key);

      res.setHeader("X-RateLimit-Limit", points);
      res.setHeader("X-RateLimit-Remaining", rateLimiterRes.remainingPoints);

      next();
    } catch (error) {
      if (!(error instanceof RateLimiterRes)) {
        // Redis unreachable or another unexpected failure — fail open.
        // A rate limiter outage should degrade to "unprotected" rather
        // than take down auth/signup/resend flows entirely.
        logger.error(
          { err: error, keyPrefix },
          "Rate limiter error — failing open",
        );
        next();
        return;
      }

      const retryAfter = Math.ceil(error.msBeforeNext / 1000);
      res.setHeader("Retry-After", retryAfter);
      res.setHeader("X-RateLimit-Limit", points);
      res.setHeader("X-RateLimit-Remaining", error.remainingPoints);
      res.setHeader(
        "X-RateLimit-Reset",
        Math.ceil((Date.now() + error.msBeforeNext) / 1000),
      );

      next(
        new TooManyRequestsError(
          `Too many requests. Please try again in ${formatRetryAfter(retryAfter)}.`,
        ),
      );
    }
  };
}
