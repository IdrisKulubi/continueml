"use client";

import * as React from "react";
import { Button, buttonVariants } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { type VariantProps } from "class-variance-authority";

interface RetryButtonProps
  extends Omit<React.ComponentProps<"button">, "onClick">,
    VariantProps<typeof buttonVariants> {
  onRetry: () => void | Promise<void>;
  isRetrying?: boolean;
  attempt?: number;
  maxAttempts?: number;
  showAttempts?: boolean;
  asChild?: boolean;
}

/**
 * Retry button component with loading state
 */
export function RetryButton({
  onRetry,
  isRetrying,
  attempt,
  maxAttempts,
  showAttempts = false,
  children,
  className,
  variant,
  size,
  asChild,
  ...props
}: RetryButtonProps) {
  const handleRetry = async () => {
    await onRetry();
  };

  const attemptsText =
    showAttempts && attempt && maxAttempts
      ? ` (${attempt}/${maxAttempts})`
      : "";

  return (
    <Button
      onClick={handleRetry}
      disabled={isRetrying}
      className={cn(className)}
      variant={variant}
      size={size}
      asChild={asChild}
      {...props}
    >
      <RefreshCw
        className={cn("mr-2 h-4 w-4", isRetrying && "animate-spin")}
      />
      {isRetrying
        ? `Retrying${attemptsText}...`
        : children || "Try again"}
    </Button>
  );
}

/**
 * Inline retry link component
 */
export function RetryLink({
  onRetry,
  isRetrying,
  className,
}: {
  onRetry: () => void | Promise<void>;
  isRetrying?: boolean;
  className?: string;
}) {
  return (
    <button
      onClick={onRetry}
      disabled={isRetrying}
      className={cn(
        "inline-flex items-center gap-1 text-sm text-primary hover:underline disabled:opacity-50",
        className
      )}
    >
      <RefreshCw
        className={cn("h-3 w-3", isRetrying && "animate-spin")}
      />
      {isRetrying ? "Retrying..." : "Try again"}
    </button>
  );
}
