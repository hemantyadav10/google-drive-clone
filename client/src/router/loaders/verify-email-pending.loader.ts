import { consumeVerifyEmailContext } from "../../lib/verify-email-context";

export function verifyEmailPendingLoader() {
  return consumeVerifyEmailContext();
}
