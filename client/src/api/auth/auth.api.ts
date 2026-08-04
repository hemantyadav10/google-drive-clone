import { apiClient } from "../../lib/api-client";
import { ApiResponseSchema } from "../../schemas/api.schema";
import {
  sessionListSchema,
  UserProfileSchema,
  type ChangePasswordFormData,
  type ForgotPasswordFormData,
  type LoginFormData,
  type RegisterFormData,
  type ResetPasswordFormData,
  type SessionSummary,
  type UserProfile,
} from "../../schemas/auth.schema";

export const authApi = {
  login: async (loginFormData: LoginFormData): Promise<UserProfile> => {
    const { data } = await apiClient.post("/auth/login", loginFormData);
    const response = ApiResponseSchema(UserProfileSchema).parse(data);
    return response.data;
  },

  register: async (registerFormData: RegisterFormData): Promise<void> => {
    await apiClient.post("/auth/register", registerFormData);
  },

  logout: async (): Promise<void> => {
    await apiClient.post("/auth/logout");
  },

  changePassword: async (
    changePasswordFormData: ChangePasswordFormData
  ): Promise<void> => {
    await apiClient.patch("/auth/change-password", changePasswordFormData);
  },

  listSessions: async (): Promise<SessionSummary[]> => {
    const { data } = await apiClient.get("/auth/sessions");
    const response = ApiResponseSchema(sessionListSchema).parse(data);
    return response.data;
  },

  revokeSession: async (sessionId: string): Promise<void> => {
    await apiClient.delete(`/auth/sessions/${sessionId}`);
  },

  logoutAll: async (): Promise<void> => {
    await apiClient.post(`/auth/logout-all`);
  },

  forgotPassword: async (
    forgotPasswordFormData: ForgotPasswordFormData
  ): Promise<void> => {
    await apiClient.post(`auth/forgot-password`, forgotPasswordFormData);
  },

  resetPassword: async (
    resetPasswordFormData: ResetPasswordFormData
  ): Promise<void> => {
    await apiClient.post(`auth/reset-password`, resetPasswordFormData);
  },

  verifyEmail: async (token: string): Promise<void> => {
    await apiClient.post("/auth/verify-email", { token });
  },

  resendVerificationEmail: async (email: string): Promise<void> => {
    await apiClient.post("/auth/resend-verification-email", { email });
  },
};
