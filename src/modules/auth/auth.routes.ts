import { Router } from "express";
import { authController } from "../../container.js";
import { validate } from "../../middlewares/validate-request.middleware.js";
import { loginSchema, registerSchema } from "./auth.schema.js";

const authRouter = Router();

authRouter.post(
  "/register",
  validate("body", registerSchema),
  authController.register,
);
authRouter.post("/login", validate("body", loginSchema), authController.login);
authRouter.post("/logout", authController.logout);

export { authRouter };
