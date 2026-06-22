import * as z from "zod";

const envSchema = z.object({
  LOG_LEVEL: z.enum(["debug", "info", "warn", "error"]).default("info"),
  PORT: z.coerce.number().default(3000),
  DB_URL: z.url(),
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
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
