"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { X } from "lucide-react";
import type { Entity, EntityImage, GenerationTool, GenerationStatus } from "@/types";

interface EntityWithImage extends Entity {
  primaryImage: EntityImage | null;
}

interface GenerationFiltersProps {
  worldId: string;
  entities: EntityWithImage[];
  currentFilters: {
    entityId?: string;
    tool?: string;
    status?: string;
  };
}

const GENERATION_TOOLS: { value: GenerationTool; label: string }[] = [
  { value: "runway", label: "Runway" },
  { value: "midjourney", label: "Midjourney" },
  { value: "stable_diffusion", label: "Stable Diffusion" },
  { value: "other", label: "Other" },
];

const GENERATION_STATUSES: { value: GenerationStatus; label: string }[] = [
  { value: "queued", label: "Queued" },
  { value: "processing", label: "Processing" },
  { value: "completed", label: "Completed" },
  { value: "failed", label: "Failed" },
];

export default function GenerationFilters({
  worldId,
  entities,
  currentFilters,
}: GenerationFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const updateFilter = (key: string, value: string | undefined) => {
    const params = new URLSearchParams(searchParams.toString());

    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }

    // Reset to page 1 when filters change
    params.delete("page");

    router.push(`/worlds/${worldId}/history?${params.toString()}`);
  };

  const clearFilters = () => {
    router.push(`/worlds/${worldId}/history`);
  };

  const hasActiveFilters =
    currentFilters.entityId || currentFilters.tool || currentFilters.status;

  return (
    <Card className="p-4">
      <div className="flex flex-col md:flex-row gap-4">
        {/* Entity Filter */}
        <div className="flex-1">
          <Select
            value={currentFilters.entityId || "all"}
            onValueChange={(value) =>
              updateFilter("entityId", value === "all" ? undefined : value)
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Filter by entity" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Entities</SelectItem>
              {entities.map((entity) => (
                <SelectItem key={entity.id} value={entity.id}>
                  {entity.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Tool Filter */}
        <div className="flex-1">
          <Select
            value={currentFilters.tool || "all"}
            onValueChange={(value) =>
              updateFilter("tool", value === "all" ? undefined : value)
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Filter by tool" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Tools</SelectItem>
              {GENERATION_TOOLS.map((tool) => (
                <SelectItem key={tool.value} value={tool.value}>
                  {tool.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Status Filter */}
        <div className="flex-1">
          <Select
            value={currentFilters.status || "all"}
            onValueChange={(value) =>
              updateFilter("status", value === "all" ? undefined : value)
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              {GENERATION_STATUSES.map((status) => (
                <SelectItem key={status.value} value={status.value}>
                  {status.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Clear Filters Button */}
        {hasActiveFilters && (
          <Button
            variant="outline"
            onClick={clearFilters}
            className="gap-2"
          >
            <X className="h-4 w-4" />
            Clear
          </Button>
        )}
      </div>
    </Card>
  );
}
