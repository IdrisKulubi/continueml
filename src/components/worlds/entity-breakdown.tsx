"use client";

import { EntityType } from "@/types";
import { User, MapPin, Box, Palette, Layers } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

interface EntityBreakdownProps {
  breakdown: Record<EntityType, number>;
  worldId: string;
}

const entityTypeConfig = {
  character: {
    icon: User,
    color: "bg-blue-500",
    textColor: "text-blue-600 dark:text-blue-400",
    bgColor: "bg-blue-50 dark:bg-blue-950/30",
    borderColor: "border-blue-200 dark:border-blue-800/50",
    label: "Characters",
  },
  location: {
    icon: MapPin,
    color: "bg-purple-500",
    textColor: "text-purple-600 dark:text-purple-400",
    bgColor: "bg-purple-50 dark:bg-purple-950/30",
    borderColor: "border-purple-200 dark:border-purple-800/50",
    label: "Locations",
  },
  object: {
    icon: Box,
    color: "bg-orange-500",
    textColor: "text-orange-600 dark:text-orange-400",
    bgColor: "bg-orange-50 dark:bg-orange-950/30",
    borderColor: "border-orange-200 dark:border-orange-800/50",
    label: "Objects",
  },
  style: {
    icon: Palette,
    color: "bg-pink-500",
    textColor: "text-pink-600 dark:text-pink-400",
    bgColor: "bg-pink-50 dark:bg-pink-950/30",
    borderColor: "border-pink-200 dark:border-pink-800/50",
    label: "Styles",
  },
  custom: {
    icon: Layers,
    color: "bg-gray-500",
    textColor: "text-gray-600 dark:text-gray-400",
    bgColor: "bg-gray-50 dark:bg-gray-950/30",
    borderColor: "border-gray-200 dark:border-gray-800/50",
    label: "Custom",
  },
};

export function EntityBreakdown({ breakdown, worldId }: EntityBreakdownProps) {
  const router = useRouter();

  // Calculate total and percentages
  const total = Object.values(breakdown).reduce((sum, count) => sum + count, 0);

  const handleTypeClick = (type: EntityType) => {
    router.push(`/worlds/${worldId}/entities?type=${type}`);
  };

  if (total === 0) {
    return (
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Entity Breakdown
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-8">
          No entities yet. Create your first entity to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6">
        Entity Breakdown
      </h3>

      <div className="space-y-3">
        {(Object.entries(breakdown) as [EntityType, number][])
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          .filter(([_, count]) => count > 0)
          .sort(([, a], [, b]) => b - a)
          .map(([type, count]) => {
            const config = entityTypeConfig[type];
            const Icon = config.icon;
            const percentage = Math.round((count / total) * 100);

            return (
              <button
                key={type}
                onClick={() => handleTypeClick(type)}
                className={cn(
                  "w-full text-left p-4 rounded-xl border transition-all duration-300 hover:shadow-md hover:-translate-y-0.5",
                  config.borderColor,
                  config.bgColor
                )}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className={cn("w-8 h-8 rounded-full flex items-center justify-center", config.color)}>
                      <Icon className="w-4 h-4 text-white" />
                    </div>
                    <span className={cn("font-medium", config.textColor)}>
                      {config.label}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {percentage}%
                    </span>
                    <span className={cn("text-lg font-bold", config.textColor)}>
                      {count}
                    </span>
                  </div>
                </div>
                
                {/* Progress Bar */}
                <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className={cn("h-full transition-all duration-500", config.color)}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </button>
            );
          })}
      </div>

      {/* Total */}
      <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-800">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
            Total Entities
          </span>
          <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {total}
          </span>
        </div>
      </div>
    </div>
  );
}
