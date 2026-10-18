import { sql, type SQL, type Table } from "drizzle-orm";
import path from "path";
import { db } from "../db/index.js";
import { generateUUIDv7 } from "./uuid.js";

/**
 * Checks whether at least one row exists in the given table that matches the specified conditions.
 *
 * Uses PostgreSQL `EXISTS` for an efficient short-circuit query (stops scanning as soon as a match is found).
 *
 * @param table - Drizzle table reference to query against
 * @param conditions - SQL conditions to apply in the WHERE clause (Drizzle SQL fragment)
 * @returns A boolean indicating whether a matching record exists
 *
 * @example
 * const exists = await recordExists(users, eq(users.email, email));
 * if (exists) {
 *   throw new Error("User already exists");
 * }
 */
async function recordExists(table: Table, conditions: SQL): Promise<boolean> {
  const res = await db.execute(sql`
    SELECT EXISTS(
      SELECT 1 FROM ${table}
      WHERE ${conditions}
    ) AS "exists"`);

  const result = res.rows[0]?.["exists"];

  return typeof result === "boolean" ? result : false;
}

function formatRetryAfter(totalSeconds: number): string {
  if (!Number.isFinite(totalSeconds) || totalSeconds <= 0) {
    return "a moment";
  }

  const seconds = Math.floor(totalSeconds);

  if (seconds < 60) {
    return `${seconds} second${seconds === 1 ? "" : "s"}`;
  }

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  if (minutes < 60) {
    const minuteText = `${minutes} minute${minutes === 1 ? "" : "s"}`;

    if (remainingSeconds === 0) {
      return minuteText;
    }

    const secondText = `${remainingSeconds} second${
      remainingSeconds === 1 ? "" : "s"
    }`;

    return `${minuteText} and ${secondText}`;
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (hours < 24) {
    const hourText = `${hours} hour${hours === 1 ? "" : "s"}`;

    if (remainingMinutes === 0) {
      return hourText;
    }

    const minuteText = `${remainingMinutes} minute${
      remainingMinutes === 1 ? "" : "s"
    }`;

    return `${hourText} and ${minuteText}`;
  }

  const days = Math.floor(hours / 24);
  const remainingHours = hours % 24;

  const dayText = `${days} day${days === 1 ? "" : "s"}`;

  if (remainingHours === 0) {
    return dayText;
  }

  const hourText = `${remainingHours} hour${remainingHours === 1 ? "" : "s"}`;

  return `${dayText} and ${hourText}`;
}

function formatDurationHuman(ms: number): string {
  const hours = ms / (60 * 60 * 1000);

  if (hours >= 1 && Number.isInteger(hours)) {
    return `${hours} hour${hours === 1 ? "" : "s"}`;
  }

  const minutes = ms / (60 * 1000);
  return `${minutes} minute${minutes === 1 ? "" : "s"}`;
}

function buildNodePath(id: string, parentPath?: string | null): string {
  const label = id.replaceAll("-", "_");
  return parentPath ? `${parentPath}.${label}` : label;
}

function generateObjectKey(userId: string, originalFilename: string): string {
  const fileId = generateUUIDv7();
  const extension = path.extname(originalFilename).toLowerCase();
  return `${userId}/${fileId}${extension}`;
}

function getMultipartPlan(totalSize: number): {
  partSize: number;
  totalParts: number;
} {
  const MIN_PART_SIZE_BYTES = 16 * 1024 * 1024; // 16MB
  const MAX_PART_SIZE_BYTES = 512 * 1024 * 1024; // 512MB
  const MAX_PARTS = 10_000;

  const GB = 1024 * 1024 * 1024;

  let partSize: number;
  if (totalSize < 1 * GB) {
    partSize = 16 * 1024 * 1024; // 16MB
  } else if (totalSize < 10 * GB) {
    partSize = 64 * 1024 * 1024; // 64MB
  } else if (totalSize < 100 * GB) {
    partSize = 128 * 1024 * 1024; // 128MB
  } else {
    partSize = 256 * 1024 * 1024; // 256MB
  }

  partSize = Math.min(
    Math.max(partSize, Math.ceil(totalSize / MAX_PARTS), MIN_PART_SIZE_BYTES),
    MAX_PART_SIZE_BYTES,
  );

  const totalParts = Math.ceil(totalSize / partSize);
  return { partSize, totalParts };
}

function stringifyParams(params: unknown[]): string {
  return JSON.stringify(params, (_key, value) =>
    typeof value === "bigint" ? value.toString() : value,
  );
}

export {
  buildNodePath,
  formatDurationHuman,
  formatRetryAfter,
  generateObjectKey,
  getMultipartPlan,
  recordExists,
  stringifyParams,
};
