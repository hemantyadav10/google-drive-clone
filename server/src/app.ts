import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import { env } from "./config/env.js";
import { HttpStatus } from "./constants/http-status-codes.js";
import { pool } from "./db/index.js";
import errorHandler from "./middlewares/error-handler.middleware.js";
import { globalLimiter } from "./middlewares/rate-limiters/auth.rate-limiters.js";
import router from "./router.js";
import { httpLogger } from "./utils/index.js";

// Initialize Express app
const app = express();

// Enable when deployed behind a reverse proxy or load balancer.
// app.set("trust proxy", 1);

// Middleware
app.use(
  cors({
    origin: [env.CLIENT_URL, "http://localhost:5174"],
    credentials: true,
    exposedHeaders: [
      "Retry-After",
      "X-RateLimit-Limit",
      "X-RateLimit-Remaining",
      "X-RateLimit-Reset",
    ],
  }),
);
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(httpLogger);

// Health check
app.get("/health", async (_req, res) => {
  try {
    await pool.query("SELECT 1");
    res.status(HttpStatus.OK).json({ status: "ok" });
  } catch {
    res.status(HttpStatus.SERVICE_UNAVAILABLE).json({ status: "degraded" });
  }
});

// Global rate limiter
app.use(globalLimiter);

// Router
app.use("/api", router);

// Error handling middleware
app.use(errorHandler);

export default app;
