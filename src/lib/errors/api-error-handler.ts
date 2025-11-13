import { NextResponse } from "next/server";
import { AppError } from "./app-error";
import { ErrorCode } from "./error-codes";
import { errorLogger } from "./error-logger";
import { ZodError } from "zod";

/**
 * Handle errors in API routes and return appropriate responses
 */
export function handleApiError(error: unknown): NextResponse {
  // Log the error
  if (error instanceof Error) {
    errorLogger.logError(error);
  } else {
    errorLogger.logError(new Error(String(error)));
  }

  // Handle AppError
  if (error instanceof AppError) {
    return NextResponse.json(error.toJSON(), {
      status: error.statusCode,
    });
  }

  // Handle Zod validation errors
  if (error instanceof ZodError) {
    const appError = new AppError(
      ErrorCode.VALIDATION_ERROR,
      "Validation failed",
      error.issues
    );
    return NextResponse.json(appError.toJSON(), {
      status: appError.statusCode,
    });
  }

  // Handle generic errors
  if (error instanceof Error) {
    // Check for specific error patterns
    if (error.message.includes("ECONNREFUSED")) {
      const appError = new AppError(
        ErrorCode.CONNECTION_ERROR,
        "Database connection failed"
      );
      return NextResponse.json(appError.toJSON(), {
        status: appError.statusCode,
      });
    }

    if (error.message.includes("timeout")) {
      const appError = new AppError(
        ErrorCode.TIMEOUT,
        "Request timeout"
      );
      return NextResponse.json(appError.toJSON(), {
        status: appError.statusCode,
      });
    }

    // Generic error response
    const appError = new AppError(
      ErrorCode.INTERNAL_SERVER_ERROR,
      error.message
    );
    return NextResponse.json(appError.toJSON(), {
      status: appError.statusCode,
    });
  }

  // Unknown error
  const appError = new AppError(
    ErrorCode.UNKNOWN_ERROR,
    "An unknown error occurred"
  );
  return NextResponse.json(appError.toJSON(), {
    status: appError.statusCode,
  });
}

/**
 * Wrapper for API route handlers with automatic error handling
 */
export function withErrorHandler<T extends unknown[]>(
  handler: (...args: T) => Promise<NextResponse>
) {
  return async (...args: T): Promise<NextResponse> => {
    try {
      return await handler(...args);
    } catch (error) {
      return handleApiError(error);
    }
  };
}

/**
 * Create a standardized success response
 */
export function createSuccessResponse<T>(
  data: T,
  status: number = 200
): NextResponse {
  return NextResponse.json(
    {
      success: true,
      data,
      timestamp: new Date().toISOString(),
    },
    { status }
  );
}

/**
 * Create a standardized error response
 */
export function createErrorResponse(
  code: ErrorCode,
  message: string,
  details?: unknown,
  status?: number
): NextResponse {
  const error = new AppError(code, message, details);
  return NextResponse.json(error.toJSON(), {
    status: status || error.statusCode,
  });
}
