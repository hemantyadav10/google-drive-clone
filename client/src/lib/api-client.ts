import { clearAuthAndRedirect } from "@/api/auth/auth.query";
import axios from "axios";
import { ApiError, isApiErrorResponse } from "./api-errors";
import { queryClient } from "./query-client";
import { queryKeys } from "./query-keys";

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_BASE_URL,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
  timeout: 10_000,
});

// Generic messages used when the server cannot provide a user-friendly error.
const FALLBACK_MESSAGE = "Something went wrong. Please try again.";
const NETWORK_ERROR_MESSAGE =
  "Unable to reach the server. Check your connection.";
const TIMEOUT_ERROR_MESSAGE = "The request timed out. Please try again.";

let isRedirectingToLogin = false;

function redirectToLogin() {
  if (isRedirectingToLogin) return;

  isRedirectingToLogin = true;
  void clearAuthAndRedirect(queryClient).finally(() => {
    isRedirectingToLogin = false;
  });
}

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (axios.isAxiosError(error)) {
      // Request exceeded the configured timeout.
      if (error.code === "ECONNABORTED" || error.code === "ETIMEDOUT") {
        return Promise.reject(
          new ApiError(TIMEOUT_ERROR_MESSAGE, undefined, undefined, {
            cause: error,
          })
        );
      }

      if (error.response) {
        const data: unknown = error.response.data;

        // Server returned an error in the application's standard error format.
        if (isApiErrorResponse(data)) {
          if (error.status === 401 && data.code === "SESSION_EXPIRED") {
            // Expired authenticated session. Guests may legitimately receive 401s,
            // so only redirect if we previously had an authenticated user.
            const previousUser = queryClient.getQueryData(
              queryKeys.currentUser
            );

            queryClient.setQueryData(queryKeys.currentUser, null);

            if (previousUser) {
              redirectToLogin();
            }
          }
          return Promise.reject(
            new ApiError(data.message, error.response.status, data, {
              cause: error,
            })
          );
        }

        // Server responded, but not with our expected error shape
        return Promise.reject(
          new ApiError(FALLBACK_MESSAGE, error.response.status, undefined, {
            cause: error,
          })
        );
      }

      // Request reached the network layer but no response was received.
      if (error.request) {
        return Promise.reject(
          new ApiError(NETWORK_ERROR_MESSAGE, undefined, undefined, {
            cause: error,
          })
        );
      }
    }

    // Non-Axios or unexpected errors.
    return Promise.reject(
      error instanceof Error
        ? new ApiError(error.message, undefined, undefined, { cause: error })
        : new ApiError("An unexpected error occurred.", undefined, undefined, {
            cause: error,
          })
    );
  }
);
