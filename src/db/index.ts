import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { env } from "../config/env.js";
import { logger } from "../utils/index.js";

export const pool: Pool = new Pool({
  connectionString: env.DB_URL,
  ssl: env.NODE_ENV === "production",
  connectionTimeoutMillis: 2000,
  idleTimeoutMillis: 30000,
  statement_timeout: 10000,
});

export const db = drizzle({
  client: pool,
  logger: env.NODE_ENV === "development",
});

export async function testDbConnection(): Promise<void> {
  try {
    await pool.query("SELECT 1");
    logger.info("Connected to PostgreSQL");
  } catch (error) {
    logger.fatal({ err: error }, "Failed to connect to the database");
    throw error;
  }
}

export type Database = typeof db;
