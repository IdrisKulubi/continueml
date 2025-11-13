import { ErrorCode } from "./error-codes";

/**
 * User-friendly error messages for each error code
 */
export const ErrorMessages: Record<ErrorCode, string> = {
  // Authentication errors
  [ErrorCode.UNAUTHORIZED]:
    "You need to be logged in to access this resource.",
  [ErrorCode.FORBIDDEN]:
    "You don't have permission to access this resource.",
  [ErrorCode.SESSION_EXPIRED]:
    "Your session has expired. Please log in again.",
  [ErrorCode.INVALID_CREDENTIALS]:
    "Invalid email or password. Please try again.",

  // Resource errors
  [ErrorCode.NOT_FOUND]:
    "The requested resource could not be found.",
  [ErrorCode.ALREADY_EXISTS]:
    "A resource with this information already exists.",
  [ErrorCode.RESOURCE_DELETED]:
    "This resource has been deleted and is no longer available.",

  // Validation errors
  [ErrorCode.VALIDATION_ERROR]:
    "Please check your input and try again.",
  [ErrorCode.INVALID_INPUT]:
    "The information you provided is invalid.",
  [ErrorCode.MISSING_REQUIRED_FIELD]:
    "Please fill in all required fields.",
  [ErrorCode.FILE_TOO_LARGE]:
    "The file you're trying to upload is too large.",
  [ErrorCode.INVALID_FILE_TYPE]:
    "This file type is not supported. Please use a different file.",

  // External API errors
  [ErrorCode.EXTERNAL_API_ERROR]:
    "We're having trouble connecting to an external service. Please try again later.",
  [ErrorCode.OPENAI_API_ERROR]:
    "We're having trouble generating embeddings. Please try again later.",
  [ErrorCode.REPLICATE_API_ERROR]:
    "We're having trouble processing your image. Please try again later.",
  [ErrorCode.PINECONE_API_ERROR]:
    "We're having trouble with vector search. Please try again later.",
  [ErrorCode.STORAGE_ERROR]:
    "We're having trouble uploading your file. Please try again.",

  // Database errors
  [ErrorCode.DATABASE_ERROR]:
    "We're experiencing database issues. Please try again later.",
  [ErrorCode.QUERY_FAILED]:
    "We couldn't complete your request. Please try again.",
  [ErrorCode.CONNECTION_ERROR]:
    "We're having trouble connecting to the database. Please try again later.",

  // Rate limiting
  [ErrorCode.RATE_LIMIT_EXCEEDED]:
    "You've made too many requests. Please wait a moment and try again.",
  [ErrorCode.TOO_MANY_REQUESTS]:
    "Too many requests. Please slow down and try again.",

  // Server errors
  [ErrorCode.INTERNAL_SERVER_ERROR]:
    "Something went wrong on our end. We're working to fix it.",
  [ErrorCode.SERVICE_UNAVAILABLE]:
    "This service is temporarily unavailable. Please try again later.",
  [ErrorCode.TIMEOUT]:
    "The request took too long to complete. Please try again.",

  // Unknown errors
  [ErrorCode.UNKNOWN_ERROR]:
    "An unexpected error occurred. Please try again.",
};

/**
 * Get user-friendly error message for an error code
 */
export function getErrorMessage(code: ErrorCode, customMessage?: string): string {
  return customMessage || ErrorMessages[code] || ErrorMessages[ErrorCode.UNKNOWN_ERROR];
}

/**
 * Suggested actions for each error code
 */
export const ErrorActions: Partial<Record<ErrorCode, string>> = {
  [ErrorCode.UNAUTHORIZED]: "Please log in to continue.",
  [ErrorCode.SESSION_EXPIRED]: "Please log in again to continue.",
  [ErrorCode.FORBIDDEN]: "Contact support if you believe this is an error.",
  [ErrorCode.NOT_FOUND]: "Check the URL or go back to the previous page.",
  [ErrorCode.FILE_TOO_LARGE]: "Try compressing the file or using a smaller one.",
  [ErrorCode.INVALID_FILE_TYPE]: "Supported formats: JPG, PNG, WebP.",
  [ErrorCode.RATE_LIMIT_EXCEEDED]: "Wait a few minutes before trying again.",
  [ErrorCode.EXTERNAL_API_ERROR]: "Try again in a few moments.",
  [ErrorCode.DATABASE_ERROR]: "Try again in a few moments.",
  [ErrorCode.SERVICE_UNAVAILABLE]: "Check our status page for updates.",
};

/**
 * Get suggested action for an error code
 */
export function getErrorAction(code: ErrorCode): string | undefined {
  return ErrorActions[code];
}

/**
 * Check if error should show retry button
 */
export function shouldShowRetry(code: ErrorCode): boolean {
  const retryableCodes = [
    ErrorCode.TIMEOUT,
    ErrorCode.SERVICE_UNAVAILABLE,
    ErrorCode.CONNECTION_ERROR,
    ErrorCode.EXTERNAL_API_ERROR,
    ErrorCode.OPENAI_API_ERROR,
    ErrorCode.REPLICATE_API_ERROR,
    ErrorCode.PINECONE_API_ERROR,
    ErrorCode.STORAGE_ERROR,
    ErrorCode.DATABASE_ERROR,
    ErrorCode.QUERY_FAILED,
    ErrorCode.RATE_LIMIT_EXCEEDED,
  ];
  return retryableCodes.includes(code);
}
