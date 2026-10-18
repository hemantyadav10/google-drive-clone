import * as z from "zod";

const envSchema = z.object({
  LOG_LEVEL: z.enum(["debug", "info", "warn", "error"]).default("info"),

  PORT: z.coerce.number().default(3000),

  DB_URL: z.url(),

  REDIS_URL: z.url(),

  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),

  CLIENT_URL: z.url(),

  APP_NAME: z.string().min(1).default("DriveClone"),

  RATE_LIMIT_ENABLED_IN_DEV: z
    .string()
    .default("false")
    .transform((val) => val.trim().toLowerCase() === "true"),

  // Cloudflare Turnstile
  TURNSTILE_SECRET_KEY: z.string().min(1, "TURNSTILE_SECRET_KEY is required"),

  // Google OAuth
  GOOGLE_CLIENT_ID: z.string().min(1, "GOOGLE_CLIENT_ID is required"),
  GOOGLE_CLIENT_SECRET: z.string().min(1, "GOOGLE_CLIENT_SECRET is required"),
  GOOGLE_REDIRECT_URI: z.url(),

  // Email
  RESEND_API_KEY: z.string().min(1, "RESEND_API_KEY is required"),
  EMAIL_FROM: z.email(),

  MAILPIT_HOST: z.string().default("localhost"),
  MAILPIT_PORT: z.coerce.number().default(1025),

  // Object Storage
  S3_ACCESS_KEY_ID: z.string().min(1, "S3_ACCESS_KEY_ID is required"),
  S3_SECRET_ACCESS_KEY: z.string().min(1, "S3_SECRET_ACCESS_KEY is required"),
  S3_BUCKET_NAME: z.string().min(1, "S3_BUCKET_NAME is required"),
  S3_ENDPOINT: z.url(),
  S3_REGION: z.string().default("auto"),
});

const { success, data, error } = envSchema.safeParse(process.env);

if (!success) {
  console.error(
    "❌ Invalid environment variables:",
    z.flattenError(error).fieldErrors,
  );
  process.exit(1);
}

export const env = data;
