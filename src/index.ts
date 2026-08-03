import http from "node:http";
import app from "./app.js";
import { env } from "./config/env.js";
import { redis } from "./config/redis.js";
import { emailService } from "./container.js";
import { pool, testDbConnection } from "./db/index.js";
import { EmailWorker } from "./modules/email/email.worker.js";
import { logger } from "./utils/index.js";

let server: http.Server;
let isShuttingDown = false;
const port = env.PORT ?? 8080;
let emailWorker: EmailWorker;

async function startServer(): Promise<void> {
  try {
    await testDbConnection();
    try {
      await redis.ping();
    } catch {
      logger.warn(
        "Starting server without Redis — queue/rate-limit features degraded",
      );
    }

    emailWorker = new EmailWorker(emailService);
    logger.info("Email worker started");

    server = app.listen(port, () => {
      logger.info(`Server is running on http://localhost:${port}`);
    });

    process.on("SIGINT", () => void shutdownAndExit("SIGINT"));
    process.on("SIGTERM", () => void shutdownAndExit("SIGTERM"));
  } catch (error) {
    logger.fatal(error as Error, "Failed to start server");
    process.exit(1);
  }
}

const shutdownAndExit = async (signal: string) => {
  if (isShuttingDown) return;
  isShuttingDown = true;

  logger.warn(`Signal received: "${signal}". Starting graceful shutdown...`);

  // Start the force-exit timer immediately
  const forceExit = setTimeout(() => {
    logger.fatal("Graceful shutdown timed out. Force exiting.");
    process.exit(1);
  }, 10000);

  // Unref ensures the timer itself doesn't keep the Node process alive
  // if everything else finishes timer ends.
  forceExit.unref();

  try {
    // Stop accepting new HTTP connections
    logger.info("Closing HTTP server...");
    await new Promise<void>((resolve, reject) => {
      server.close((err) => {
        if (err) return reject(err);
        resolve();
      });
    });
    logger.info("HTTP server closed");

    // Close DB connections
    logger.info("Closing database connection pool...");
    await pool.end();
    logger.info("Database connection pool closed");

    logger.info("Closing Redis connection...");
    try {
      await redis.quit();
      logger.info("Redis connection closed");
    } catch (error) {
      logger.warn(
        error as Error,
        "Redis did not close cleanly, forcing disconnect",
      );
      redis.disconnect();
    }

    logger.info("Closing email worker...");
    await emailWorker.close();
    logger.info("Email worker closed");

    // Clear the timeout and exit cleanly
    clearTimeout(forceExit);
    logger.info("Graceful shutdown complete");
    process.exit(0);
  } catch (error) {
    logger.fatal(error as Error, "Failed during graceful shutdown");
    process.exit(1);
  }
};

process.on("unhandledRejection", (reason) => {
  if (reason instanceof Error) {
    logger.error(reason, "Unhandled Rejection caught");
  } else {
    logger.error({ reason }, "Unhandled Rejection caught");
  }
  throw reason;
});

process.on("uncaughtException", (err) => {
  logger.fatal(err, "Uncaught Exception caught");
  shutdownAndExit("uncaughtException");
});

void startServer();
