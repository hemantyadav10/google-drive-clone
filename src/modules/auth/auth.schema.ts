import * as z from "zod";

export const registerSchema = z
  .object({
    fullName: z
      .string()
      .trim()
      .min(2, "Name should be at least 2 characters")
      .max(100, "Name is too long"),
    email: z.email().trim().toLowerCase(),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(72, "Password is too long"),
    confirmPassword: z.string(),
  })
  .refine((val) => val.password === val.confirmPassword, {
    error: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const loginSchema = z.object({
  email: z.email("Invalid email").trim().toLowerCase(),
  password: z.string().min(1, "Password is required"),
});

export const sessionIdParamsSchema = z.object({
  sessionId: z.uuid("Invalid session ID"),
});

export type SessionIdParams = z.infer<typeof sessionIdParamsSchema>;
export type RegisterDto = z.infer<typeof registerSchema>;
export type LoginDto = z.infer<typeof loginSchema>;
