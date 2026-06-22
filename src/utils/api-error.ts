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
  constructor(message = "Bad Request") {
    super(message, {
      statusCode: HttpStatus.BAD_REQUEST,
      code: ErrorCodes.BAD_REQUEST,
    });
  }
}

class NotFoundError extends ApiError {
  constructor(message = "Not Found") {
    super(message, {
      statusCode: HttpStatus.NOT_FOUND,
      code: ErrorCodes.NOT_FOUND,
    });
  }
}

class UnauthorizedError extends ApiError {
  constructor(message = "Unauthorized") {
    super(message, {
      statusCode: HttpStatus.UNAUTHORIZED,
      code: ErrorCodes.UNAUTHORIZED,
    });
  }
}

class ForbiddenError extends ApiError {
  constructor(message = "Forbidden") {
    super(message, {
      statusCode: HttpStatus.FORBIDDEN,
      code: ErrorCodes.FORBIDDEN,
    });
  }
}

class ConflictError extends ApiError {
  constructor(message = "Conflict") {
    super(message, {
      statusCode: HttpStatus.CONFLICT,
      code: ErrorCodes.CONFLICT,
    });
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

export {
  ApiError,
  BadRequestError,
  ConflictError,
  ForbiddenError,
  NotFoundError,
  UnauthorizedError,
  ValidationError,
};
