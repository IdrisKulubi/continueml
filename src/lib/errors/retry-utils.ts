import { AppError } from "./app-error";
import { ErrorCode } from "./error-codes";
import { errorLogger } from "./error-logger";

/**
 * Retry configuration options
 */
export interface RetryOptions {
  maxAttempts?: number;
  initialDelay?: number;
  maxDelay?: number;
  backoffMultiplier?: number;
  retryableErrors?: ErrorCode[];
  onRetry?: (attempt: number, error: Error) => void;
}

/**
 * Default retry configuration
 */
const DEFAULT_RETRY_OPTIONS: Required<RetryOptions> = {
  maxAttempts: 3,
  initialDelay: 1000, // 1 second
  maxDelay: 10000, // 10 seconds
  backoffMultiplier: 2,
  retryableErrors: [
    ErrorCode.TIMEOUT,
    ErrorCode.SERVICE_UNAVAILABLE,
    ErrorCode.CONNECTION_ERROR,
    ErrorCode.EXTERNAL_API_ERROR,
    ErrorCode.OPENAI_API_ERROR,
    ErrorCode.REPLICATE_API_ERROR,
    ErrorCode.PINECONE_API_ERROR,
    ErrorCode.STORAGE_ERROR,
    ErrorCode.RATE_LIMIT_EXCEEDED,
  ],
  onRetry: () => {},
};

/**
 * Calculate delay for exponential backoff
 */
function calculateDelay(
  attempt: number,
  initialDelay: number,
  maxDelay: number,
  backoffMultiplier: number
): number {
  const delay = initialDelay * Math.pow(backoffMultiplier, attempt - 1);
  return Math.min(delay, maxDelay);
}

/**
 * Check if error is retryable
 */
function isRetryableError(
  error: Error | AppError,
  retryableErrors: ErrorCode[]
): boolean {
  if (error instanceof AppError) {
    return retryableErrors.includes(error.code);
  }
  return false;
}

/**
 * Sleep for specified milliseconds
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Retry a function with exponential backoff
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const config = { ...DEFAULT_RETRY_OPTIONS, ...options };
  let lastError: Error | AppError;

  for (let attempt = 1; attempt <= config.maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      // Check if we should retry
      const shouldRetry =
        attempt < config.maxAttempts &&
        isRetryableError(lastError, config.retryableErrors);

      if (!shouldRetry) {
        throw lastError;
      }

      // Log retry attempt
      errorLogger.logWarning(`Retry attempt ${attempt}/${config.maxAttempts}`, {
        error: lastError.message,
        attempt,
      });

      // Call onRetry callback
      config.onRetry(attempt, lastError);

      // Calculate and wait for delay
      const delay = calculateDelay(
        attempt,
        config.initialDelay,
        config.maxDelay,
        config.backoffMultiplier
      );
      await sleep(delay);
    }
  }

  // All retries exhausted
  throw lastError!;
}

/**
 * Retry wrapper for API calls
 */
export async function retryApiCall<T>(
  apiCall: () => Promise<Response>,
  options: RetryOptions = {}
): Promise<T> {
  return withRetry(async () => {
    const response = await apiCall();

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const error = errorData.error;

      if (error) {
        throw new AppError(
          error.code || ErrorCode.UNKNOWN_ERROR,
          error.message || "API call failed",
          error.details
        );
      }

      throw new AppError(
        ErrorCode.EXTERNAL_API_ERROR,
        `API call failed with status ${response.status}`
      );
    }

    return response.json();
  }, options);
}

/**
 * Retry state for UI components
 */
export interface RetryState {
  isRetrying: boolean;
  attempt: number;
  maxAttempts: number;
  error: Error | null;
}

/**
 * Create retry state manager for React components
 */
export function createRetryState(maxAttempts: number = 3): {
  state: RetryState;
  retry: <T>(fn: () => Promise<T>) => Promise<T>;
  reset: () => void;
} {
  const state: RetryState = {
    isRetrying: false,
    attempt: 0,
    maxAttempts,
    error: null,
  };

  const retry = async <T>(fn: () => Promise<T>): Promise<T> => {
    state.isRetrying = true;
    state.attempt = 0;
    state.error = null;

    try {
      return await withRetry(fn, {
        maxAttempts,
        onRetry: (attempt) => {
          state.attempt = attempt;
        },
      });
    } catch (error) {
      state.error = error instanceof Error ? error : new Error(String(error));
      throw error;
    } finally {
      state.isRetrying = false;
    }
  };

  const reset = () => {
    state.isRetrying = false;
    state.attempt = 0;
    state.error = null;
  };

  return { state, retry, reset };
}

/**
 * React hook for retry functionality
 */
export function useRetry(maxAttempts: number = 3) {
  const [state, setState] = React.useState<RetryState>({
    isRetrying: false,
    attempt: 0,
    maxAttempts,
    error: null,
  });

  const retry = React.useCallback(
    async <T,>(fn: () => Promise<T>): Promise<T> => {
      setState((prev) => ({ ...prev, isRetrying: true, attempt: 0, error: null }));

      try {
        return await withRetry(fn, {
          maxAttempts,
          onRetry: (attempt) => {
            setState((prev) => ({ ...prev, attempt }));
          },
        });
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error));
        setState((prev) => ({ ...prev, error: err }));
        throw error;
      } finally {
        setState((prev) => ({ ...prev, isRetrying: false }));
      }
    },
    [maxAttempts]
  );

  const reset = React.useCallback(() => {
    setState({
      isRetrying: false,
      attempt: 0,
      maxAttempts,
      error: null,
    });
  }, [maxAttempts]);

  return { ...state, retry, reset };
}

import React from "react";
