import type { CookieOptions } from "express";
import { env } from "./env.js";

export const SESSION_COOKIE_NAME =
  env.NODE_ENV === "production" ? "__Host-session" : "session";

export const SESSION_COOKIE_OPTIONS: CookieOptions = {
  httpOnly: true,
  secure: env.NODE_ENV === "production",
  sameSite: "lax",
  maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
};

export const COOKIE_NAMES = {
  GOOGLE_OAUTH_STATE: "google_oauth_state",
  GOOGLE_CODE_VERIFIER: "google_code_verifier",
} as const;

export const GOOGLE_OAUTH_COOKIE_OPTIONS: CookieOptions = {
  httpOnly: true,
  secure: env.NODE_ENV === "production",
  sameSite: "lax",
  maxAge: 10 * 60 * 1000, // 10 minutes
} as const;
