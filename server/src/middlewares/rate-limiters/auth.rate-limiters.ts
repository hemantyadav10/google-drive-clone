import type { Request } from "express";
import { createRateLimiter } from "../rate-limit.js";

const getIp = (req: Request): string => req.ip ?? "unknown";

const getIpAndEmail = (req: Request): string => {
  const rawEmail = req.body?.email ?? req.query?.["email"];

  if (typeof rawEmail !== "string") {
    return getIp(req);
  }

  const normalizedEmail = rawEmail.toLowerCase().trim();

  return `${getIp(req)}:${normalizedEmail}`;
};

export const globalLimiter = createRateLimiter({
  keyPrefix: "rl:global",
  points: 200,
  duration: 60,
  keyGenerator: getIp,
});

export const loginLimiter = createRateLimiter({
  keyPrefix: "rl:login",
  points: 5,
  duration: 15 * 60,
  keyGenerator: getIpAndEmail,
});

export const registerLimiter = createRateLimiter({
  keyPrefix: "rl:register",
  points: 3,
  duration: 60 * 60,
  keyGenerator: getIpAndEmail,
});

export const forgotPasswordLimiter = createRateLimiter({
  keyPrefix: "rl:forgot-password",
  points: 3,
  duration: 60 * 60,
  keyGenerator: getIpAndEmail,
});

export const resendVerificationLimiter = createRateLimiter({
  keyPrefix: "rl:resend-verification",
  points: 2,
  duration: 60 * 60,
  blockDuration: 60 * 60,
  keyGenerator: getIpAndEmail,
});

export const verifyEmailLimiter = createRateLimiter({
  keyPrefix: "rl:verify-email",
  points: 5,
  duration: 15 * 60,
  keyGenerator: getIp,
});
