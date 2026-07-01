import express from "express";
import { HttpStatus } from "./constants/http-status-codes.js";
import errorHandler from "./middlewares/error-handler.middleware.js";
import router from "./router.js";
import { httpLogger } from "./utils/index.js";
import helmet from "helmet";
import cookieParser from "cookie-parser";

// Initialize Express app
const app = express();

// Middleware
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(httpLogger);

// Health Check
app.get("/health", (_req, res) => {
  res.status(HttpStatus.OK).json({ status: "ok" });
});

// Router
app.use("/api", router);

// Error handling middleware
app.use(errorHandler);

export default app;
