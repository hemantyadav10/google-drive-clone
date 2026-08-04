import type { SessionSummary } from "@/schemas/auth.schema";
import {
  QueryClient,
  queryOptions,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";
import { queryKeys } from "../../lib/query-keys";
import { router } from "../../router";
import { authApi } from "./auth.api";

export function clearAuthAndRedirect(queryClient: QueryClient): Promise<void> {
  queryClient.setQueryData(queryKeys.currentUser, null);

  return router.navigate("/login").finally(() => {
    queryClient.clear();
    queryClient.setQueryData(queryKeys.currentUser, null);
  });
}

export const useLogin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authApi.login,
    onSuccess: (response) => {
      queryClient.setQueryData(queryKeys.currentUser, response);
    },
  });
};

export const useRegister = () => {
  return useMutation({ mutationFn: authApi.register });
};

export const useLogout = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authApi.logout,
    onSuccess: () => {
      void clearAuthAndRedirect(queryClient);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
};

export const useChangePassword = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authApi.changePassword,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.sessions });
    },
  });
};

export const userSessionsQuery = queryOptions({
  queryKey: queryKeys.sessions,
  queryFn: authApi.listSessions,
});

export const useRevokeSession = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authApi.revokeSession,
    onSuccess: (_, variables) => {
      const sessionId = variables;

      queryClient.setQueryData<SessionSummary[]>(
        queryKeys.sessions,
        (oldData) => {
          if (!oldData) return oldData;
          return oldData.filter((s) => s.id !== sessionId);
        }
      );

      queryClient.invalidateQueries({ queryKey: queryKeys.sessions });
    },
  });
};

export const useLogoutAll = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authApi.logoutAll,
    onSuccess: async () => {
      toast.success("Signed out of all sessions.");
      void clearAuthAndRedirect(queryClient);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
};

export const useForgotPassword = () => {
  return useMutation({
    mutationFn: authApi.forgotPassword,
  });
};

export const useResetPassword = () => {
  return useMutation({
    mutationFn: authApi.resetPassword,
  });
};

export const useVerifyEmail = () => {
  return useMutation({
    mutationFn: (token: string) => authApi.verifyEmail(token),
  });
};

export const useResendVerificationEmail = () => {
  return useMutation({
    mutationFn: (email: string) => authApi.resendVerificationEmail(email),
  });
};
