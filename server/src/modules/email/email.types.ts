export const EmailJobName = {
  VERIFY_ACCOUNT: "email:verify-account",
  PASSWORD_RESET: "email:password-reset",
  // ACCOUNT_EXISTS_NOTICE: "email:account-exists-notice",
} as const;

export type EmailJobName = (typeof EmailJobName)[keyof typeof EmailJobName];

interface VerifyAccountPayload {
  name: typeof EmailJobName.VERIFY_ACCOUNT;
  data: { email: string; fullName: string; token: string };
}

interface PasswordResetPayload {
  name: typeof EmailJobName.PASSWORD_RESET;
  data: { email: string; fullName: string; token: string };
}

export type EmailJob = VerifyAccountPayload | PasswordResetPayload;

export type SendEmailOptions = {
  to: string;
  subject: string;
  html: string;
};
