import * as z from "zod";

const emailSchema = z.email().trim().toLowerCase();
const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(72, "Password is too long");
const turnstileTokenSchema = z
  .string()
  .min(1, "Please complete the verification");

export const registerSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, "Name should be at least 2 characters")
    .max(100, "Name is too long"),
  email: emailSchema,
  password: passwordSchema,
  turnstileToken: turnstileTokenSchema,
});

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Password is required"),
  turnstileToken: turnstileTokenSchema,
});

export const sessionIdParamsSchema = z.object({
  sessionId: z.uuid("Invalid session ID"),
});

export const verifyEmailSchema = z.object({
  token: z.string().min(1, "Verification token is required"),
});

export const forgotPasswordSchema = z.object({
  email: emailSchema,
  turnstileToken: turnstileTokenSchema,
});

export const resetPasswordSchema = z
  .object({
    token: z.string().min(1, "Reset token is required"),
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((val) => val.password === val.confirmPassword, {
    error: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((val) => val.newPassword === val.confirmPassword, {
    error: "Passwords do not match",
    path: ["confirmPassword"],
  })
  .refine((val) => val.newPassword !== val.currentPassword, {
    error: "New password must be different from your current password",
    path: ["newPassword"],
  });

export const oauthCallbackQuerySchema = z.object({
  code: z.string().min(1, "Missing authorization code"),
  state: z.string().min(1, "Missing state"),
  error: z.string().optional(),
  error_description: z.string().optional(),
});

export const googleIdTokenPayloadSchema = z.object({
  iss: z.union([
    z.literal("https://accounts.google.com"),
    z.literal("accounts.google.com"),
  ]),
  sub: z.string().min(1).max(255),
  aud: z.string().min(1),
  email: z.email(),
  email_verified: z.boolean(),
  name: z.string().min(1),
  picture: z.url().optional(),
});

export const resendVerificationEmailSchema = z.object({
  email: z.email(),
});

export type GoogleIdTokenPayload = z.infer<typeof googleIdTokenPayloadSchema>;
export type OAuthCallbackQuery = z.infer<typeof oauthCallbackQuerySchema>;
export type SessionIdParams = z.infer<typeof sessionIdParamsSchema>;
export type RegisterDto = z.infer<typeof registerSchema>;
export type LoginDto = z.infer<typeof loginSchema>;
export type VerifyEmailDto = z.infer<typeof verifyEmailSchema>;
export type ForgotPasswordDto = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordDto = z.infer<typeof resetPasswordSchema>;
export type ChangePasswordDto = z.infer<typeof changePasswordSchema>;
export type TurnstileBody = z.infer<typeof turnstileTokenSchema>;
export type ResendVerificationEmailDto = z.infer<
  typeof resendVerificationEmailSchema
>;
