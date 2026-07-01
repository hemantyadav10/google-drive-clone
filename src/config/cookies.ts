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
