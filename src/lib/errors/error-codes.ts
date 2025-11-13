/**
 * Error codes for the application
 */
export enum ErrorCode {
  // Authentication errors (1xxx)
  UNAUTHORIZED = "UNAUTHORIZED",
  FORBIDDEN = "FORBIDDEN",
  SESSION_EXPIRED = "SESSION_EXPIRED",
  INVALID_CREDENTIALS = "INVALID_CREDENTIALS",

  // Resource errors (2xxx)
  NOT_FOUND = "NOT_FOUND",
  ALREADY_EXISTS = "ALREADY_EXISTS",
  RESOURCE_DELETED = "RESOURCE_DELETED",

  // Validation errors (3xxx)
  VALIDATION_ERROR = "VALIDATION_ERROR",
  INVALID_INPUT = "INVALID_INPUT",
  MISSING_REQUIRED_FIELD = "MISSING_REQUIRED_FIELD",
  FILE_TOO_LARGE = "FILE_TOO_LARGE",
  INVALID_FILE_TYPE = "INVALID_FILE_TYPE",

  // External API errors (4xxx)
  EXTERNAL_API_ERROR = "EXTERNAL_API_ERROR",
  OPENAI_API_ERROR = "OPENAI_API_ERROR",
  REPLICATE_API_ERROR = "REPLICATE_API_ERROR",
  PINECONE_API_ERROR = "PINECONE_API_ERROR",
  STORAGE_ERROR = "STORAGE_ERROR",

  // Database errors (5xxx)
  DATABASE_ERROR = "DATABASE_ERROR",
  QUERY_FAILED = "QUERY_FAILED",
  CONNECTION_ERROR = "CONNECTION_ERROR",

  // Rate limiting (6xxx)
  RATE_LIMIT_EXCEEDED = "RATE_LIMIT_EXCEEDED",
  TOO_MANY_REQUESTS = "TOO_MANY_REQUESTS",

  // Server errors (7xxx)
  INTERNAL_SERVER_ERROR = "INTERNAL_SERVER_ERROR",
  SERVICE_UNAVAILABLE = "SERVICE_UNAVAILABLE",
  TIMEOUT = "TIMEOUT",

  // Unknown errors
  UNKNOWN_ERROR = "UNKNOWN_ERROR",
}

/**
 * HTTP status codes for error responses
 */
export const ErrorStatusCodes: Record<ErrorCode, number> = {
  // Authentication errors
  [ErrorCode.UNAUTHORIZED]: 401,
  [ErrorCode.FORBIDDEN]: 403,
  [ErrorCode.SESSION_EXPIRED]: 401,
  [ErrorCode.INVALID_CREDENTIALS]: 401,

  // Resource errors
  [ErrorCode.NOT_FOUND]: 404,
  [ErrorCode.ALREADY_EXISTS]: 409,
  [ErrorCode.RESOURCE_DELETED]: 410,

  // Validation errors
  [ErrorCode.VALIDATION_ERROR]: 400,
  [ErrorCode.INVALID_INPUT]: 400,
  [ErrorCode.MISSING_REQUIRED_FIELD]: 400,
  [ErrorCode.FILE_TOO_LARGE]: 413,
  [ErrorCode.INVALID_FILE_TYPE]: 415,

  // External API errors
  [ErrorCode.EXTERNAL_API_ERROR]: 502,
  [ErrorCode.OPENAI_API_ERROR]: 502,
  [ErrorCode.REPLICATE_API_ERROR]: 502,
  [ErrorCode.PINECONE_API_ERROR]: 502,
  [ErrorCode.STORAGE_ERROR]: 502,

  // Database errors
  [ErrorCode.DATABASE_ERROR]: 500,
  [ErrorCode.QUERY_FAILED]: 500,
  [ErrorCode.CONNECTION_ERROR]: 503,

  // Rate limiting
  [ErrorCode.RATE_LIMIT_EXCEEDED]: 429,
  [ErrorCode.TOO_MANY_REQUESTS]: 429,

  // Server errors
  [ErrorCode.INTERNAL_SERVER_ERROR]: 500,
  [ErrorCode.SERVICE_UNAVAILABLE]: 503,
  [ErrorCode.TIMEOUT]: 504,

  // Unknown errors
  [ErrorCode.UNKNOWN_ERROR]: 500,
};
