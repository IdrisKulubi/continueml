import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface ProgressBarProps {
  value: number;
  max?: number;
  label?: string;
  showPercentage?: boolean;
  className?: string;
}

/**
 * Progress bar component for uploads and long operations
 */
export function ProgressBar({
  value,
  max = 100,
  label,
  showPercentage = true,
  className,
}: ProgressBarProps) {
  const percentage = Math.round((value / max) * 100);

  return (
    <div className={cn("space-y-2", className)}>
      {(label || showPercentage) && (
        <div className="flex items-center justify-between text-sm">
          {label && <span className="text-muted-foreground">{label}</span>}
          {showPercentage && (
            <span className="font-medium">{percentage}%</span>
          )}
        </div>
      )}
      <Progress value={percentage} className="h-2" />
    </div>
  );
}

/**
 * Indeterminate progress bar for unknown duration
 */
export function IndeterminateProgress({
  label,
  className,
}: {
  label?: string;
  className?: string;
}) {
  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <p className="text-sm text-muted-foreground">{label}</p>
      )}
      <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
        <div className="h-full w-1/3 animate-[progress_1.5s_ease-in-out_infinite] bg-primary" />
      </div>
    </div>
  );
}
