import { Router } from "express";
import { authController } from "../../container.js";
import { authenticate } from "../../middlewares/authenticate.middleware.js";
import {
  forgotPasswordLimiter,
  loginLimiter,
  registerLimiter,
  resendVerificationLimiter,
  verifyEmailLimiter,
} from "../../middlewares/rate-limiters/auth.rate-limiters.js";
import { validate } from "../../middlewares/validate-request.middleware.js";
import { verifyTurnstile } from "../../middlewares/verify-turnstile.middleware.js";
import {
  changePasswordSchema,
  forgotPasswordSchema,
  loginSchema,
  registerSchema,
  resendVerificationEmailSchema,
  resetPasswordSchema,
  sessionIdParamsSchema,
  verifyEmailSchema,
} from "./auth.schema.js";

const authRouter = Router();

authRouter.post(
  "/register",
  registerLimiter,
  validate("body", registerSchema),
  verifyTurnstile,
  authController.register,
);
authRouter.post(
  "/login",
  loginLimiter,
  validate("body", loginSchema),
  verifyTurnstile,
  authController.login,
);
authRouter.post("/logout", authController.logout);
authRouter.post("/logout-all", authenticate, authController.logoutAll);
authRouter.get("/sessions", authenticate, authController.listSessions);
authRouter.delete(
  "/sessions/:sessionId",
  authenticate,
  validate("params", sessionIdParamsSchema),
  authController.revokeSession,
);
authRouter.post(
  "/verify-email",
  verifyEmailLimiter,
  validate("body", verifyEmailSchema),
  authController.verifyEmail,
);
authRouter.post(
  "/forgot-password",
  forgotPasswordLimiter,
  validate("body", forgotPasswordSchema),
  verifyTurnstile,
  authController.forgotPassword,
);
authRouter.post(
  "/reset-password",
  validate("body", resetPasswordSchema),
  authController.resetPassword,
);
authRouter.patch(
  "/change-password",
  authenticate,
  validate("body", changePasswordSchema),
  authController.changePassword,
);
authRouter.get("/google", authController.googleLogin);
authRouter.get("/google/callback", authController.googleCallback);
authRouter.post(
  "/resend-verification-email",
  resendVerificationLimiter,
  validate("body", resendVerificationEmailSchema),
  authController.resendVerificationEmail,
);

export { authRouter };
