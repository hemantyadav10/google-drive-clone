import { Redis, type RedisOptions } from "ioredis";
import { logger } from "../utils/index.js";
import { env } from "./env.js";

function createRedisClient(name: string, overrides: RedisOptions = {}) {
  const client = new Redis(env.REDIS_URL, overrides);

  client.on("connect", () => logger.info(`[${name}] Connected to Redis`));
  client.on("ready", () => logger.info(`[${name}] Redis client ready`));
  client.on("error", (err) =>
    logger.error(err, `[${name}] Redis connection error`),
  );
  client.on("close", () => logger.warn(`[${name}] Redis connection closed`));
  client.on("reconnecting", () =>
    logger.warn(`[${name}] Reconnecting to Redis...`),
  );

  return client;
}

// General-purpose: caching, rate limiting, sessions.
export const redis = createRedisClient("general");

// For BullMQ
export const queueRedis = createRedisClient("bullmq", {
  maxRetriesPerRequest: null,
});
