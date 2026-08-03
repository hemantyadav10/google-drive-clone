import type { Resend } from "resend";
import type { EmailProvider } from "../email-provider.interface.js";
import type { SendEmailOptions } from "../email.types.js";
import { env } from "../../../config/env.js";

export class ResendProvider implements EmailProvider {
  constructor(private readonly resend: Resend) {}

  async send(options: SendEmailOptions): Promise<void> {
    const { error } = await this.resend.emails.send({
      to: options.to,
      from: env.EMAIL_FROM,
      subject: options.subject,
      html: options.html,
    });

    if (error) {
      throw new Error(error.message ?? "Resend send failed");
    }
  }
}
