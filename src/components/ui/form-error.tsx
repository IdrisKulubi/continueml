import { AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface FormErrorProps {
  message?: string;
  className?: string;
}

/**
 * Inline form error message component
 */
export function FormError({ message, className }: FormErrorProps) {
  if (!message) return null;

  return (
    <div
      className={cn(
        "flex items-center gap-2 text-sm text-destructive",
        className
      )}
      role="alert"
      aria-live="polite"
    >
      <AlertCircle className="h-4 w-4 shrink-0" />
      <span>{message}</span>
    </div>
  );
}

interface FormFieldErrorProps {
  error?: {
    message?: string;
  };
  className?: string;
}

/**
 * Form field error component (for use with react-hook-form)
 */
export function FormFieldError({ error, className }: FormFieldErrorProps) {
  return <FormError message={error?.message} className={className} />;
}
