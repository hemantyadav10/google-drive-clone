import {
  ErrorCodes,
  HttpStatus,
  type ErrorCode,
  type HttpStatusCode,
} from "../constants/index.js";

export interface ValidationIssue {
  code: string;
  path: string;
  message: string;
}

export interface ApiErrorOptions {
  statusCode?: HttpStatusCode;
  code?: ErrorCode;
  errors?: ValidationIssue[];
}

class ApiError extends Error {
  public readonly success = false;
  public readonly statusCode: HttpStatusCode;
  public readonly code: ErrorCode;
  public readonly errors: ValidationIssue[] | undefined;

  constructor(
    message = "Something went wrong",
    {
      statusCode = HttpStatus.INTERNAL_SERVER_ERROR,
      code = ErrorCodes.INTERNAL_SERVER_ERROR,
      errors,
    }: ApiErrorOptions = {},
  ) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.errors = errors;
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

class BadRequestError extends ApiError {
  constructor(
    message = "Bad Request",
    code: ErrorCode = ErrorCodes.BAD_REQUEST,
  ) {
    super(message, { statusCode: HttpStatus.BAD_REQUEST, code });
  }
}

class NotFoundError extends ApiError {
  constructor(message = "Not Found", code: ErrorCode = ErrorCodes.NOT_FOUND) {
    super(message, { statusCode: HttpStatus.NOT_FOUND, code });
  }
}

class UnauthorizedError extends ApiError {
  constructor(
    message = "Unauthorized",
    code: ErrorCode = ErrorCodes.UNAUTHORIZED,
  ) {
    super(message, { statusCode: HttpStatus.UNAUTHORIZED, code });
  }
}

class ForbiddenError extends ApiError {
  constructor(message = "Forbidden", code: ErrorCode = ErrorCodes.FORBIDDEN) {
    super(message, { statusCode: HttpStatus.FORBIDDEN, code });
  }
}

class ConflictError extends ApiError {
  constructor(message = "Conflict", code: ErrorCode = ErrorCodes.CONFLICT) {
    super(message, { statusCode: HttpStatus.CONFLICT, code });
  }
}

class ValidationError extends ApiError {
  constructor(errors: ValidationIssue[], message = "Validation Failed") {
    super(message, {
      statusCode: HttpStatus.BAD_REQUEST,
      code: ErrorCodes.VALIDATION_ERROR,
      errors,
    });
  }
}

class TooManyRequestsError extends ApiError {
  constructor(message = "Too many requests. Please try again later.") {
    super(message, {
      statusCode: HttpStatus.TOO_MANY_REQUESTS,
      code: ErrorCodes.TOO_MANY_REQUESTS,
    });
  }
}

export {
  ApiError,
  BadRequestError,
  ConflictError,
  ForbiddenError,
  NotFoundError,
  UnauthorizedError,
  ValidationError,
  TooManyRequestsError,
};
