"use client";

import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { CheckCircle2, AlertTriangle, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface ConsistencyBadgeProps {
  score: number;
  showIcon?: boolean;
  showTooltip?: boolean;
}

export default function ConsistencyBadge({
  score,
  showIcon = true,
  showTooltip = true,
}: ConsistencyBadgeProps) {
  // Determine color and icon based on score
  const getScoreConfig = (score: number) => {
    if (score >= 90) {
      return {
        label: "Excellent",
        color: "bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20",
        icon: CheckCircle2,
        description: "Excellent consistency with entity references",
      };
    } else if (score >= 75) {
      return {
        label: "Good",
        color: "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20",
        icon: AlertTriangle,
        description: "Good consistency with minor variations",
      };
    } else {
      return {
        label: "Low",
        color: "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20",
        icon: XCircle,
        description: "Low consistency - consider regenerating",
      };
    }
  };

  const config = getScoreConfig(score);
  const Icon = config.icon;

  const badge = (
    <Badge 
      variant="outline" 
      className={cn("gap-1.5", config.color)}
      aria-label={`Consistency score: ${score}%, ${config.label}`}
    >
      {showIcon && <Icon className="h-3 w-3" aria-hidden="true" />}
      <span>{score}%</span>
    </Badge>
  );

  if (!showTooltip) {
    return badge;
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>{badge}</TooltipTrigger>
        <TooltipContent>
          <div className="space-y-1">
            <p className="font-medium">{config.label} Consistency</p>
            <p className="text-xs text-muted-foreground">{config.description}</p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
