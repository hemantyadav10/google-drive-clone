import express from "express";
import { HttpStatus } from "./constants/http-status-codes.js";
import errorHandler from "./middlewares/error-handler.middleware.js";
import { httpLogger } from "./utils/logger.js";

// Initialize Express app
const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(httpLogger);

// Health Check
app.get("/health", (_req, res) => {
  res.status(HttpStatus.OK).json({ status: "ok" });
});

// Routes

// Error handling middleware
app.use(errorHandler);

export default app;
