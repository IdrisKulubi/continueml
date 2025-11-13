import { toast } from "sonner";
import { AppError } from "./app-error";
import { ErrorCode } from "./error-codes";
import { getErrorMessage, getErrorAction, shouldShowRetry } from "./error-messages";

/**
 * Show error toast notification
 */
export function showErrorToast(
  error: Error | AppError | string,
  options?: {
    action?: {
      label: string;
      onClick: () => void;
    };
    duration?: number;
  }
) {
  let message: string;
  let description: string | undefined;
  let action = options?.action;

  if (typeof error === "string") {
    message = error;
  } else if (error instanceof AppError) {
    message = getErrorMessage(error.code, error.message);
    description = getErrorAction(error.code);

    // Add retry action if error is retryable and no custom action provided
    if (!action && shouldShowRetry(error.code)) {
      action = {
        label: "Retry",
        onClick: () => {
          // This will be overridden by the caller if needed
          window.location.reload();
        },
      };
    }
  } else {
    message = error.message || "An unexpected error occurred";
  }

  toast.error(message, {
    description,
    action,
    duration: options?.duration || 5000,
  });
}

/**
 * Show success toast notification
 */
export function showSuccessToast(
  message: string,
  options?: {
    description?: string;
    duration?: number;
  }
) {
  toast.success(message, {
    description: options?.description,
    duration: options?.duration || 3000,
  });
}

/**
 * Show info toast notification
 */
export function showInfoToast(
  message: string,
  options?: {
    description?: string;
    duration?: number;
  }
) {
  toast.info(message, {
    description: options?.description,
    duration: options?.duration || 4000,
  });
}

/**
 * Show warning toast notification
 */
export function showWarningToast(
  message: string,
  options?: {
    description?: string;
    duration?: number;
  }
) {
  toast.warning(message, {
    description: options?.description,
    duration: options?.duration || 4000,
  });
}

/**
 * Show loading toast notification
 */
export function showLoadingToast(message: string) {
  return toast.loading(message);
}

/**
 * Dismiss a toast by ID
 */
export function dismissToast(toastId: string | number) {
  toast.dismiss(toastId);
}

/**
 * Show promise toast (loading -> success/error)
 */
export function showPromiseToast<T>(
  promise: Promise<T>,
  messages: {
    loading: string;
    success: string | ((data: T) => string);
    error: string | ((error: unknown) => string);
  }
) {
  return toast.promise(promise, messages);
}

/**
 * Handle API error and show appropriate toast
 */
export async function handleApiResponse<T>(
  response: Response,
  options?: {
    successMessage?: string;
    onRetry?: () => void;
  }
): Promise<T> {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const error = errorData.error;

    if (error) {
      const appError = new AppError(
        error.code || ErrorCode.UNKNOWN_ERROR,
        error.message || "An error occurred",
        error.details
      );

      showErrorToast(appError, {
        action: options?.onRetry
          ? {
              label: "Retry",
              onClick: options.onRetry,
            }
          : undefined,
      });

      throw appError;
    }

    throw new Error("An unexpected error occurred");
  }

  const data = await response.json();

  if (options?.successMessage) {
    showSuccessToast(options.successMessage);
  }

  return data;
}
