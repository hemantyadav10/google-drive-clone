/// <reference types="node" />
import { defineConfig } from "drizzle-kit";

const DB_URL = process.env["DB_URL"];
if (!DB_URL) throw new Error("DB_URL is not set in environment variables");

export default defineConfig({
  out: "./src/db/migrations",
  schema: "./src/db/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: DB_URL,
  },
  strict: true,
  verbose: true,
  casing: "snake_case",
});
