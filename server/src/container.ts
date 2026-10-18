import { Resend } from "resend";
import { env } from "./config/env.js";
import { s3Client } from "./config/s3.js";
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
import { SseService } from "./modules/events/sse.service.js";
import { NodesController } from "./modules/nodes/nodes.controller.js";
import { NodesRepository } from "./modules/nodes/nodes.repository.js";
import { NodesService } from "./modules/nodes/nodes.service.js";
import { ProcessingQueue } from "./modules/processing/processing.queue.js";
import { ProcessingService } from "./modules/processing/processing.service.js";
import { ImageProcessor } from "./modules/processing/processors/image.processor.js";
import { PdfProcessor } from "./modules/processing/processors/pdf.processor.js";
import { VideoProcessor } from "./modules/processing/processors/video.processor.js";
import { StorageService } from "./modules/storage/storage.service.js";
import { UploadsController } from "./modules/uploads/uploads.controller.js";
import { UploadsRepository } from "./modules/uploads/uploads.repository.js";
import { UploadsService } from "./modules/uploads/uploads.service.js";
import { UserController } from "./modules/user/user.controller.js";
import { UserRepository } from "./modules/user/user.repository.js";
import { UserService } from "./modules/user/user.service.js";

const storageService = new StorageService(s3Client);
export const sseService = new SseService();

const emailProvider =
  env.NODE_ENV === "development"
    ? new MailPitProvider()
    : new ResendProvider(new Resend(env.RESEND_API_KEY));

export const resend = new Resend(env.RESEND_API_KEY);
export const emailQueue = new EmailQueue();
export const emailVerificationRepository = new EmailVerificationRepository(db);
export const emailService = new EmailService(emailProvider);

export const passwordResetRepository = new PasswordResetRepository(db);

export const userRepository = new UserRepository(db);
export const userService = new UserService(db, userRepository);
export const userController = new UserController(userService);

export const accountRepository = new AccountRepository(db);

export const authRepository = new AuthRepository(db);
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

export const nodesRepository = new NodesRepository(db);
export const nodesService = new NodesService(
  db,
  nodesRepository,
  storageService,
);
export const nodesController = new NodesController(nodesService);

const imageProcessor = new ImageProcessor(storageService);
const pdfProcessor = new PdfProcessor(storageService);
const videoProcessor = new VideoProcessor(storageService);

export const processingQueue = new ProcessingQueue();
export const processingService = new ProcessingService(
  nodesService,
  imageProcessor,
  pdfProcessor,
  videoProcessor,
  storageService,
  sseService,
);

export const uploadsRepository = new UploadsRepository(db);
export const uploadsService = new UploadsService(
  db,
  uploadsRepository,
  nodesService,
  processingQueue,
  storageService,
);
export const uploadsController = new UploadsController(uploadsService);
