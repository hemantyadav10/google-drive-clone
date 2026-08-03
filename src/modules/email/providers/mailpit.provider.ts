import nodemailer from "nodemailer";
import { env } from "../../../config/env.js";
import { logger } from "../../../utils/logger.js";
import type { EmailProvider } from "../email-provider.interface.js";
import type { SendEmailOptions } from "../email.types.js";

export class MailPitProvider implements EmailProvider {
  private readonly transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: env.MAILPIT_HOST,
      port: env.MAILPIT_PORT,
      secure: false,
    });
  }

  async send(options: SendEmailOptions): Promise<void> {
    const info = await this.transporter.sendMail({
      from: env.EMAIL_FROM,
      to: options.to,
      subject: options.subject,
      html: options.html,
    });

    logger.debug(
      { messageId: info.messageId, to: options.to },
      "Email sent via Mailpit",
    );
  }
}
