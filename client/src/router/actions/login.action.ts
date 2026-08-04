import { loginSchema } from "@/schemas/auth.schema";
import { redirect } from "react-router";
import { authApi } from "../../api/auth/auth.api";
import {
  ApiError,
  type ApiErrorResponse,
  type ValidationIssue,
} from "../../lib/api-errors";
import { queryClient } from "../../lib/query-client";
import { queryKeys } from "../../lib/query-keys";
import { setVerifyEmailContext } from "../../lib/verify-email-context";

export async function loginAction({ request }: { request: Request }) {
  const formData = await request.formData();
  const rawData = Object.fromEntries(formData);
  const { data, success, error } = loginSchema.safeParse(rawData);

  if (!success) {
    const validationIssue: ValidationIssue[] = error.issues.map((e) => ({
      code: e.code,
      path: e.path.join("."),
      message: e.message,
    }));
    const errorResponse: ApiErrorResponse = {
      message: "Validation Failed",
      code: "VALIDATION_ERROR",
      success: false,
      errors: validationIssue,
    };

    return errorResponse;
  }

  try {
    const response = await authApi.login(data);

    queryClient.setQueryData(queryKeys.currentUser, response);

    return redirect("/home");
  } catch (error) {
    if (error instanceof ApiError) {
      if (error.data?.code === "EMAIL_NOT_VERIFIED") {
        setVerifyEmailContext({ email: data.email, source: "login" });
        return redirect("/verify-email-pending");
      }
      return error.data;
    }

    throw error;
  }
}
