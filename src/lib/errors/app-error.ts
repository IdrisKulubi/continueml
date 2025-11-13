import { ErrorCode, ErrorStatusCodes } from "./error-codes";

/**
 * Custom application error class with error codes and metadata
 */
export class AppError extends Error {
  public readonly code: ErrorCode;
  public readonly statusCode: number;
  public readonly details?: unknown;
  public readonly isOperational: boolean;
  public readonly timestamp: Date;

  constructor(
    code: ErrorCode,
    message: string,
    details?: unknown,
    isOperational: boolean = true
  ) {
    super(message);
    this.name = "AppError";
    this.code = code;
    this.statusCode = ErrorStatusCodes[code];
    this.details = details;
    this.isOperational = isOperational;
    this.timestamp = new Date();

    // Maintains proper stack trace for where our error was thrown
    Error.captureStackTrace(this, this.constructor);
  }

  /**
   * Convert error to JSON for API responses
   */
  toJSON() {
    return {
      error: {
        code: this.code,
        message: this.message,
        details: this.details,
        timestamp: this.timestamp.toISOString(),
      },
    };
  }

  /**
   * Check if error is retryable
   */
  isRetryable(): boolean {
    const retryableCodes = [
      ErrorCode.TIMEOUT,
      ErrorCode.SERVICE_UNAVAILABLE,
      ErrorCode.CONNECTION_ERROR,
      ErrorCode.EXTERNAL_API_ERROR,
      ErrorCode.RATE_LIMIT_EXCEEDED,
    ];
    return retryableCodes.includes(this.code);
  }
}

/**
 * Factory functions for common errors
 */
export const ErrorFactory = {
  unauthorized(message: string = "Unauthorized access") {
    return new AppError(ErrorCode.UNAUTHORIZED, message);
  },

  forbidden(message: string = "Access forbidden") {
    return new AppError(ErrorCode.FORBIDDEN, message);
  },

  notFound(resource: string, id?: string) {
    const message = id
      ? `${resource} with ID ${id} not found`
      : `${resource} not found`;
    return new AppError(ErrorCode.NOT_FOUND, message);
  },

  validationError(message: string, details?: unknown) {
    return new AppError(ErrorCode.VALIDATION_ERROR, message, details);
  },

  invalidInput(field: string, reason?: string) {
    const message = reason
      ? `Invalid input for ${field}: ${reason}`
      : `Invalid input for ${field}`;
    return new AppError(ErrorCode.INVALID_INPUT, message);
  },

  fileTooLarge(maxSize: string) {
    return new AppError(
      ErrorCode.FILE_TOO_LARGE,
      `File size exceeds maximum allowed size of ${maxSize}`
    );
  },

  invalidFileType(allowedTypes: string[]) {
    return new AppError(
      ErrorCode.INVALID_FILE_TYPE,
      `Invalid file type. Allowed types: ${allowedTypes.join(", ")}`
    );
  },

  externalApiError(service: string, originalError?: unknown) {
    return new AppError(
      ErrorCode.EXTERNAL_API_ERROR,
      `External API error from ${service}`,
      originalError
    );
  },

  databaseError(message: string, originalError?: unknown) {
    return new AppError(ErrorCode.DATABASE_ERROR, message, originalError);
  },

  rateLimitExceeded(retryAfter?: number) {
    return new AppError(
      ErrorCode.RATE_LIMIT_EXCEEDED,
      "Rate limit exceeded. Please try again later.",
      { retryAfter }
    );
  },

  internalServerError(message: string = "Internal server error") {
    return new AppError(ErrorCode.INTERNAL_SERVER_ERROR, message);
  },

  serviceUnavailable(service: string) {
    return new AppError(
      ErrorCode.SERVICE_UNAVAILABLE,
      `${service} is currently unavailable`
    );
  },
};
