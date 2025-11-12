"use client";

import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  onClick?: () => void;
  className?: string;
  iconClassName?: string;
}

export function StatCard({
  icon: Icon,
  label,
  value,
  trend,
  onClick,
  className,
  iconClassName,
}: StatCardProps) {
  const isClickable = !!onClick;

  return (
    <div
      className={cn(
        "bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm transition-all duration-300",
        isClickable && "cursor-pointer hover:shadow-lg hover:-translate-y-1 hover:border-indigo-300 dark:hover:border-indigo-700",
        className
      )}
      onClick={onClick}
      role={isClickable ? "button" : undefined}
      tabIndex={isClickable ? 0 : undefined}
      onKeyDown={isClickable ? (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick?.();
        }
      } : undefined}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-3">
            <div className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center",
              iconClassName || "bg-indigo-50 dark:bg-indigo-950/30"
            )}>
              <Icon className={cn(
                "w-5 h-5",
                iconClassName ? "" : "text-indigo-600 dark:text-indigo-400"
              )} />
            </div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
              {label}
            </p>
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            {value}
          </p>
        </div>
        {trend && (
          <div className={cn(
            "text-sm font-medium px-2 py-1 rounded-full",
            trend.isPositive
              ? "text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-950/30"
              : "text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-950/30"
          )}>
            {trend.isPositive ? "+" : ""}{trend.value}%
          </div>
        )}
      </div>
    </div>
  );
}
