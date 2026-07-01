import { Router } from "express";
import { authController } from "../../container.js";
import { authenticate } from "../../middlewares/authenticate.middleware.js";
import { validate } from "../../middlewares/validate-request.middleware.js";
import {
  loginSchema,
  registerSchema,
  sessionIdParamsSchema,
} from "./auth.schema.js";

const authRouter = Router();

authRouter.post(
  "/register",
  validate("body", registerSchema),
  authController.register,
);
authRouter.post("/login", validate("body", loginSchema), authController.login);
authRouter.post("/logout", authController.logout);
authRouter.post("/logout-all", authenticate, authController.logoutAll);
authRouter.get("/sessions", authenticate, authController.listSessions);
authRouter.delete(
  "/sessions/:sessionId",
  authenticate,
  validate("params", sessionIdParamsSchema),
  authController.revokeSession,
);

export { authRouter };
