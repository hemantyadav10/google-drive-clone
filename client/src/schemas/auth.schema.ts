import * as z from "zod";
import { makeFieldGuard } from "../lib/form-utils";

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

export const forgotPasswordSchema = z.object({
  email: emailSchema,
  turnstileToken: turnstileTokenSchema,
});

export const UserProfileSchema = z.object({
  id: z.string(),
  email: z.email(),
  fullName: z.string(),
  createdAt: z.coerce.date(),
  profilePicture: z.string().nullish(),
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

export const deviceTypeSchema = z.enum([
  "desktop",
  "mobile",
  "tablet",
  "console",
  "smarttv",
  "wearable",
  "unknown",
]);

export const sessionSummarySchema = z.object({
  id: z.string(),
  createdAt: z.coerce.date(),
  browserName: z.string().nullable(),
  osName: z.string().nullable(),
  deviceType: deviceTypeSchema.nullable(),
  ipAddress: z.string().nullable(),
  lastActiveAt: z.coerce.date(),
  expiresAt: z.coerce.date(),
  isCurrent: z.boolean(),
});

export const sessionListSchema = z.array(sessionSummarySchema);

export type SessionSummary = z.infer<typeof sessionSummarySchema>;

export type UserProfile = z.infer<typeof UserProfileSchema>;

export type RegisterFormData = z.infer<typeof registerSchema>;
export const isRegisterFormField = makeFieldGuard<keyof RegisterFormData>(
  Object.keys(registerSchema.shape) as (keyof RegisterFormData)[]
);

export type LoginFormData = z.infer<typeof loginSchema>;
export const isLoginFormField = makeFieldGuard<keyof LoginFormData>(
  Object.keys(loginSchema.shape) as (keyof LoginFormData)[]
);

export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;
export const isForgotPasswordFormField = makeFieldGuard<
  keyof ForgotPasswordFormData
>(Object.keys(forgotPasswordSchema.shape) as (keyof ForgotPasswordFormData)[]);

export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;
export const isChangePasswordFormField = makeFieldGuard<
  keyof ChangePasswordFormData
>(Object.keys(changePasswordSchema.shape) as (keyof ChangePasswordFormData)[]);

export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;
export const isResetPasswordFormField = makeFieldGuard<
  keyof ResetPasswordFormData
>(Object.keys(resetPasswordSchema.shape) as (keyof ResetPasswordFormData)[]);

export type DeviceType = z.infer<typeof deviceTypeSchema>;
