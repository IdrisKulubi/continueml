import { Suspense } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { DotPattern } from "@/components/ui/dot-pattern";
import { Plus } from "lucide-react";
import { getEntitiesAction } from "@/app/actions/entities";
import { worldService } from "@/lib/worlds/world-service";
import { getCurrentUserId } from "@/lib/auth/session";
import { EntityCard } from "@/components/entities/entity-card";
import { EntitySearchFilters } from "@/components/entities/entity-search-filters";
import type { EntityType } from "@/types";

interface PageProps {
  params: Promise<{ worldId: string }>;
  searchParams: Promise<{
    type?: EntityType;
    tags?: string;
    search?: string;
  }>;
}

async function EntitiesList({
  worldId,
  searchParams,
}: {
  worldId: string;
  searchParams: {
    type?: EntityType;
    tags?: string;
    search?: string;
  };
}) {
  const userId = await getCurrentUserId();
  if (!userId) {
    notFound();
  }

  // Verify world ownership
  const world = await worldService.getWorldById(worldId, userId);
  if (!world) {
    notFound();
  }

  // Parse filters from search params
  const filters = {
    type: searchParams.type,
    tags: searchParams.tags ? searchParams.tags.split(",").filter(Boolean) : undefined,
    search: searchParams.search,
  };

  // Fetch entities
  const result = await getEntitiesAction(worldId, filters);

  if (!result.success) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 dark:text-red-400">{result.error}</p>
      </div>
    );
  }

  const entities = result.data;

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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {entities.map((entity) => (
        <EntityCard key={entity.id} entity={entity} worldId={worldId} />
      ))}
    </div>
  );
}

function EntitiesListSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6">
          <Skeleton className="w-full h-48 mb-4 rounded-lg" />
          <Skeleton className="h-6 w-3/4 mb-2" />
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      ))}
    </div>
  );
}

export default async function EntitiesPage({ params, searchParams }: PageProps) {
  const { worldId } = await params;
  const resolvedSearchParams = await searchParams;

  return (
    <div className="relative min-h-screen bg-linear-to-br from-gray-50 via-indigo-50/30 to-purple-50/30 dark:from-gray-950 dark:via-indigo-950/30 dark:to-purple-950/30">
      {/* Animated Dot Pattern Background */}
      <DotPattern
        width={24}
        height={24}
        cx={1}
        cy={1}
        cr={1.2}
        className="text-indigo-400/40 dark:text-indigo-400/20"
        glow={true}
      />
      
      {/* Gradient Overlay for better contrast */}
      <div className="absolute inset-0 bg-linear-to-b from-transparent via-white/50 to-white/80 dark:via-gray-950/50 dark:to-gray-950/80 pointer-events-none" />
      
      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              Entities
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Manage characters, locations, objects, and styles for your world
            </p>
          </div>
          <Button asChild>
            <Link href={`/worlds/${worldId}/entities/new`}>
              <Plus className="w-4 h-4 mr-2" />
              Create Entity
            </Link>
          </Button>
        </div>

        {/* Search and Filters */}
        <EntitySearchFilters worldId={worldId} />

        {/* Entities List */}
        <Suspense fallback={<EntitiesListSkeleton />}>
          <EntitiesList worldId={worldId} searchParams={resolvedSearchParams} />
        </Suspense>
      </div>
    </div>
  );
}
