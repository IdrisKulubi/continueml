"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Search, X, Filter } from "lucide-react";
import { EntityType } from "@/types";
import { useDebounce } from "@/hooks/use-debounce";

interface EntitySearchFiltersProps {
  worldId: string;
}

const entityTypes: { value: EntityType; label: string }[] = [
  { value: "character", label: "Character" },
  { value: "location", label: "Location" },
  { value: "object", label: "Object" },
  { value: "style", label: "Style" },
  { value: "custom", label: "Custom" },
];

export function EntitySearchFilters({ worldId }: EntitySearchFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "");
  const [selectedType, setSelectedType] = useState<EntityType | "all">(
    (searchParams.get("type") as EntityType) || "all"
  );
  const [selectedTags, setSelectedTags] = useState<string[]>(
    searchParams.get("tags")?.split(",").filter(Boolean) || []
  );

  const debouncedSearch = useDebounce(searchQuery, 300);

  // Update URL when filters change
  const updateFilters = useCallback(
    (search: string, type: EntityType | "all", tags: string[]) => {
      const params = new URLSearchParams();

      if (search) {
        params.set("search", search);
      }

      if (type !== "all") {
        params.set("type", type);
      }

      if (tags.length > 0) {
        params.set("tags", tags.join(","));
      }

      const queryString = params.toString();
      const newUrl = queryString
        ? `/worlds/${worldId}/entities?${queryString}`
        : `/worlds/${worldId}/entities`;

      router.push(newUrl);
    },
    [router, worldId]
  );

  // Update URL when debounced search changes
  useEffect(() => {
    updateFilters(debouncedSearch, selectedType, selectedTags);
  }, [debouncedSearch, selectedType, selectedTags, updateFilters]);

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
  };

  const handleTypeChange = (value: string) => {
    setSelectedType(value as EntityType | "all");
  };

  const handleClearFilters = () => {
    setSearchQuery("");
    setSelectedType("all");
    setSelectedTags([]);
    router.push(`/worlds/${worldId}/entities`);
  };

  const hasActiveFilters = searchQuery || selectedType !== "all" || selectedTags.length > 0;

  return (
    <div className="mb-6 space-y-4">
      {/* Search and Type Filter Row */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" aria-hidden="true" />
          <Input
            type="text"
            placeholder="Search entities by name or description..."
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-10 pr-10"
            aria-label="Search entities"
          />
          {searchQuery && (
            <button
              onClick={() => handleSearchChange("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              aria-label="Clear search"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          )}
        </div>

        {/* Type Filter */}
        <Select value={selectedType} onValueChange={handleTypeChange}>
          <SelectTrigger className="w-full sm:w-[180px]" aria-label="Filter by entity type">
            <Filter className="h-4 w-4 mr-2" aria-hidden="true" />
            <SelectValue placeholder="All Types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {entityTypes.map((type) => (
              <SelectItem key={type.value} value={type.value}>
                {type.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Clear Filters Button */}
        {hasActiveFilters && (
          <Button
            variant="outline"
            onClick={handleClearFilters}
            className="w-full sm:w-auto"
          >
            <X className="h-4 w-4 mr-2" aria-hidden="true" />
            Clear Filters
          </Button>
        )}
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm text-gray-600 dark:text-gray-400">Active filters:</span>

          {searchQuery && (
            <Badge variant="secondary" className="gap-1">
              Search: {searchQuery}
              <button
                onClick={() => handleSearchChange("")}
                className="ml-1 hover:text-gray-900 dark:hover:text-gray-100"
                aria-label="Remove search filter"
              >
                <X className="h-3 w-3" aria-hidden="true" />
              </button>
            </Badge>
          )}

          {selectedType !== "all" && (
            <Badge variant="secondary" className="gap-1">
              Type: {entityTypes.find((t) => t.value === selectedType)?.label}
              <button
                onClick={() => handleTypeChange("all")}
                className="ml-1 hover:text-gray-900 dark:hover:text-gray-100"
                aria-label="Remove type filter"
              >
                <X className="h-3 w-3" aria-hidden="true" />
              </button>
            </Badge>
          )}

          {selectedTags.map((tag) => (
            <Badge key={tag} variant="secondary" className="gap-1">
              Tag: {tag}
              <button
                onClick={() => setSelectedTags(selectedTags.filter((t) => t !== tag))}
                className="ml-1 hover:text-gray-900 dark:hover:text-gray-100"
                aria-label={`Remove ${tag} tag filter`}
              >
                <X className="h-3 w-3" aria-hidden="true" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
