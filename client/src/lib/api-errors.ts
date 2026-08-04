export type AuthErrorCode =
  | "EMAIL_NOT_VERIFIED"
  | "INVALID_CREDENTIALS"
  | "ACCOUNT_LOCKED"
  | "SESSION_EXPIRED"
  | "VALIDATION_ERROR";

export interface ValidationIssue {
  code: string;
  path: string;
  message: string;
}

export interface ApiErrorResponse {
  success: false;
  message: string;
  code: AuthErrorCode;
  errors?: ValidationIssue[];
}

export function isApiErrorResponse(data: unknown): data is ApiErrorResponse {
  if (typeof data !== "object" || data === null) {
    return false;
  }

  const obj = data as Record<string, unknown>;

  return (
    obj.success === false &&
    typeof obj.message === "string" &&
    typeof obj.code === "string" &&
    (obj.errors === undefined || Array.isArray(obj.errors))
  );
}

export class ApiError extends Error {
  public readonly status?: number;
  public readonly data?: ApiErrorResponse;

  constructor(
    message: string,
    status?: number,
    data?: ApiErrorResponse,
    options?: ErrorOptions
  ) {
    super(message, options);

    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}
