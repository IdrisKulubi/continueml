import * as React from "react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";
import { type VariantProps } from "class-variance-authority";

interface LoadingButtonProps
  extends React.ComponentProps<"button">,
    VariantProps<typeof buttonVariants> {
  loading?: boolean;
  loadingText?: string;
  asChild?: boolean;
}

/**
 * Button component with loading state
 */
export function LoadingButton({
  loading,
  loadingText,
  children,
  disabled,
  className,
  variant,
  size,
  asChild,
  ...props
}: LoadingButtonProps) {
  return (
    <Button
      disabled={disabled || loading}
      className={cn(className)}
      variant={variant}
      size={size}
      asChild={asChild}
      {...props}
    >
      {loading && <Spinner className="mr-2 h-4 w-4" />}
      {loading && loadingText ? loadingText : children}
    </Button>
  );
}
