"use client";

import { useEffect, useState } from "react";
import { useBranchStore } from "@/lib/stores/branch-store";
import { getEntitiesAction } from "@/app/actions/entities";
import { EntityCard } from "@/components/entities/entity-card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";
import type { Entity, EntityType } from "@/types";

interface EntitiesListWrapperProps {
  worldId: string;
  searchParams: {
    type?: EntityType;
    tags?: string;
    search?: string;
  };
}

export function EntitiesListWrapper({ worldId, searchParams }: EntitiesListWrapperProps) {
  const { currentBranch } = useBranchStore();
  const [entities, setEntities] = useState<Entity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadEntities = async () => {
      setLoading(true);
      setError(null);

      const filters = {
        type: searchParams.type,
        tags: searchParams.tags ? searchParams.tags.split(",").filter(Boolean) : undefined,
        search: searchParams.search,
        branchId: currentBranch?.id || null,
      };

      const result = await getEntitiesAction(worldId, filters);

      if (result.success) {
        setEntities(result.data);
      } else {
        setError(result.error);
      }

      setLoading(false);
    };

    loadEntities();
  }, [worldId, currentBranch?.id, searchParams.type, searchParams.tags, searchParams.search]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-4 sm:p-6">
            <Skeleton className="w-full h-48 mb-4 rounded-lg" />
            <Skeleton className="h-6 w-3/4 mb-2" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 dark:text-red-400">{error}</p>
      </div>
    );
  }

  if (entities.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="mx-auto w-24 h-24 mb-4 rounded-full bg-indigo-50 dark:bg-indigo-950/30 flex items-center justify-center">
          <Plus className="w-12 h-12 text-indigo-400 dark:text-indigo-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
          No entities yet
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
          {searchParams.search || searchParams.type || searchParams.tags
            ? "No entities match your filters. Try adjusting your search criteria."
            : currentBranch
            ? `No entities in the "${currentBranch.name}" branch yet. Create your first entity or switch to a different branch.`
            : "Create your first entity to start building your world's memory."}
        </p>
        {!searchParams.search && !searchParams.type && !searchParams.tags && (
          <Button asChild>
            <Link href={`/worlds/${worldId}/entities/new`}>
              <Plus className="w-4 h-4 mr-2" />
              Create Entity
            </Link>
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
      {entities.map((entity) => (
        <EntityCard key={entity.id} entity={entity} worldId={worldId} />
      ))}
    </div>
  );
}
