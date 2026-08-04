import type { SendEmailOptions } from "./email.types.js";

export interface EmailProvider {
  send(options: SendEmailOptions): Promise<void>;
}
