import { registerSchema } from "@/schemas/auth.schema";
import { redirect } from "react-router";
import { authApi } from "../../api/auth/auth.api";
import {
  ApiError,
  type ApiErrorResponse,
  type ValidationIssue,
} from "../../lib/api-errors";
import { queryClient } from "../../lib/query-client";
import { queryKeys } from "../../lib/query-keys";
import { setVerifyEmailContext } from "@/lib/verify-email-context";

export async function registerAction({ request }: { request: Request }) {
  const formData = await request.formData();
  const rawData = Object.fromEntries(formData);
  const { data, success, error } = registerSchema.safeParse(rawData);

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
    const response = await authApi.register(data);

    queryClient.setQueryData(queryKeys.currentUser, response);

    setVerifyEmailContext({ email: data.email, source: "register" });

    return redirect("/verify-email-pending");
  } catch (error) {
    if (error instanceof ApiError) return error.data;

    throw error;
  }
}
