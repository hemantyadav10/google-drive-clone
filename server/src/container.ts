import { Resend } from "resend";
import { env } from "./config/env.js";
import { db } from "./db/index.js";
import { AccountRepository } from "./modules/auth/account.repository.js";
import { AuthController } from "./modules/auth/auth.controller.js";
import { AuthRepository } from "./modules/auth/auth.repository.js";
import { AuthService } from "./modules/auth/auth.service.js";
import { EmailVerificationRepository } from "./modules/auth/email-verification.repository.js";
import { PasswordResetRepository } from "./modules/auth/password-reset.repository.js";
import { EmailQueue } from "./modules/email/email.queue.js";
import { EmailService } from "./modules/email/email.service.js";
import { MailPitProvider } from "./modules/email/providers/mailpit.provider.js";
import { ResendProvider } from "./modules/email/providers/resend.provider.js";
import { NodesController } from "./modules/nodes/nodes.controller.js";
import { NodesRepository } from "./modules/nodes/nodes.repository.js";
import { NodesService } from "./modules/nodes/nodes.service.js";
import { UserController } from "./modules/user/user.controller.js";
import { UserRepository } from "./modules/user/user.repository.js";
import { UserService } from "./modules/user/user.service.js";

const emailProvider =
  env.NODE_ENV === "development"
    ? new MailPitProvider()
    : new ResendProvider(new Resend(env.RESEND_API_KEY));

export const resend = new Resend(env.RESEND_API_KEY);
export const emailQueue = new EmailQueue();
export const emailVerificationRepository = new EmailVerificationRepository();
export const emailService = new EmailService(emailProvider);

export const passwordResetRepository = new PasswordResetRepository();

export const userRepository = new UserRepository();
export const userService = new UserService(db, userRepository);
export const userController = new UserController(userService);

export const accountRepository = new AccountRepository();

export const authRepository = new AuthRepository();
export const authService = new AuthService(
  db,
  authRepository,
  userService,
  emailQueue,
  emailVerificationRepository,
  passwordResetRepository,
  accountRepository,
);
export const authController = new AuthController(authService);

export const nodesRepository = new NodesRepository();
export const nodesService = new NodesService(db, nodesRepository);
export const nodesController = new NodesController(nodesService);
