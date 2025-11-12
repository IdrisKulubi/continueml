"use client";

import { StatCard } from "./stat-card";
import { Layers, Sparkles, Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface DashboardStatsProps {
  entityCount: number;
  generationCount: number;
  lastActivity: Date | null;
  worldId: string;
}

export function DashboardStats({
  entityCount,
  generationCount,
  lastActivity,
  worldId,
}: DashboardStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <StatCard
        icon={Layers}
        label="Total Entities"
        value={entityCount}
        onClick={() => (window.location.href = `/worlds/${worldId}/entities`)}
        iconClassName="bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400"
      />
      <StatCard
        icon={Sparkles}
        label="Generations"
        value={generationCount}
        onClick={() => (window.location.href = `/worlds/${worldId}/history`)}
        iconClassName="bg-purple-50 dark:bg-purple-950/30 text-purple-600 dark:text-purple-400"
      />
      <StatCard
        icon={Clock}
        label="Last Activity"
        value={
          lastActivity
            ? formatDistanceToNow(lastActivity, { addSuffix: true })
            : "No activity"
        }
        iconClassName="bg-pink-50 dark:bg-pink-950/30 text-pink-600 dark:text-pink-400"
      />
    </div>
  );
}
