import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";

interface LoadingOverlayProps {
  loading?: boolean;
  message?: string;
  className?: string;
  children?: React.ReactNode;
}

/**
 * Loading overlay component for long operations
 */
export function LoadingOverlay({
  loading,
  message,
  className,
  children,
}: LoadingOverlayProps) {
  if (!loading) return <>{children}</>;

  return (
    <div className={cn("relative", className)}>
      {children}
      <div className="absolute inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
        <div className="flex flex-col items-center gap-3">
          <Spinner className="h-8 w-8" />
          {message && (
            <p className="text-sm text-muted-foreground">{message}</p>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Full page loading overlay
 */
export function FullPageLoader({ message }: { message?: string }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-3">
        <Spinner className="h-8 w-8" />
        {message && (
          <p className="text-sm text-muted-foreground">{message}</p>
        )}
      </div>
    </div>
  );
}
