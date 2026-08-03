import { env } from "../../config/env.js";
import {
  PASSWORD_RESET_TOKEN_LIFETIME_MS,
  VERIFICATION_TOKEN_LIFETIME_MS,
} from "../../constants/auth.js";
import { ErrorCodes } from "../../constants/error-codes.js";
import { HttpStatus } from "../../constants/http-status-codes.js";
import { ApiError } from "../../utils/api-error.js";
import { formatDurationHuman } from "../../utils/helper.js";
import { logger } from "../../utils/logger.js";
import type { EmailProvider } from "./email-provider.interface.js";
import { resetPasswordEmailHtml } from "./templates/reset-password.js";
import { verifyAccountEmailHtml } from "./templates/verify-account.js";

export class EmailService {
  constructor(private readonly provider: EmailProvider) {}

  async sendVerificationEmail(data: {
    email: string;
    fullName: string;
    token: string;
  }): Promise<void> {
    const verificationLink = `${env.CLIENT_URL}/verify-email?token=${data.token}`;

    const html = verifyAccountEmailHtml({
      fullName: data.fullName,
      verificationLink,
      expiryText: formatDurationHuman(VERIFICATION_TOKEN_LIFETIME_MS),
    });

    try {
      await this.provider.send({
        to: data.email,
        subject: "Verify your email",
        html,
      });
    } catch (error) {
      logger.error(
        { email: data.email, error },
        "Failed to send verification email",
      );

      throw new ApiError("Failed to send verification email", {
        statusCode: HttpStatus.BAD_GATEWAY,
        code: ErrorCodes.EMAIL_SEND_FAILED,
      });
    }
  }

  async sendPasswordResetEmail(data: {
    email: string;
    fullName: string;
    token: string;
  }): Promise<void> {
    const resetPasswordLink = `${env.CLIENT_URL}/reset-password?token=${data.token}`;

    const html = resetPasswordEmailHtml({
      fullName: data.fullName,
      resetPasswordLink,
      expiryText: formatDurationHuman(PASSWORD_RESET_TOKEN_LIFETIME_MS),
    });

    try {
      await this.provider.send({
        to: data.email,
        subject: "Reset your password",
        html,
      });
    } catch (error) {
      logger.error(
        { email: data.email, error },
        "Failed to send password reset email",
      );

      throw new ApiError("Failed to send password reset email", {
        statusCode: HttpStatus.BAD_GATEWAY,
        code: ErrorCodes.EMAIL_SEND_FAILED,
      });
    }
  }
}
