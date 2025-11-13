import { Suspense } from "react";
import { notFound } from "next/navigation";
import { auth } from "../../../../../../auth";
import { worldService } from "@/lib/worlds/world-service";
import { getGenerationsAction } from "@/app/actions/generations";
import { Skeleton } from "@/components/ui/skeleton";
import GenerationHistory from "@/components/generations/generation-history";
import GenerationFilters from "@/components/generations/generation-filters";
import { entityService } from "@/lib/entities/entity-service";
import type {
  GenerationFilters as GenerationFiltersInput,
  GenerationStatus,
  GenerationTool,
} from "@/types";

const generationTools: GenerationTool[] = [
  "runway",
  "midjourney",
  "stable_diffusion",
  "other",
];

const generationStatuses: GenerationStatus[] = [
  "queued",
  "processing",
  "completed",
  "failed",
];

const isValidGenerationTool = (value: string): value is GenerationTool =>
  generationTools.includes(value as GenerationTool);

const isValidGenerationStatus = (value: string): value is GenerationStatus =>
  generationStatuses.includes(value as GenerationStatus);

interface HistoryPageProps {
  params: Promise<{
    worldId: string;
  }>;
  searchParams: Promise<{
    entityId?: string;
    tool?: string;
    status?: string;
    page?: string;
  }>;
}

async function HistoryContent({
  worldId,
  searchParams,
}: {
  worldId: string;
  searchParams: {
    entityId?: string;
    tool?: string;
    status?: string;
    page?: string;
  };
}) {
  const session = await auth.api.getSession({
    headers: await import("next/headers").then((mod) => mod.headers()),
  });

  if (!session?.user) {
    notFound();
  }

  // Verify user owns this world
  const world = await worldService.getWorldById(worldId, session.user.id);
  if (!world) {
    notFound();
  }

  // Get entities for filter dropdown
  const entitiesRaw = await entityService.getEntities(worldId, {
    isArchived: false,
  });

  // Map to ensure primaryImage is null instead of undefined
  const entitiesWithImages = entitiesRaw.map((entity) => ({
    ...entity,
    primaryImage: entity.primaryImage || null,
  }));

  // Parse filters from search params
  const page = parseInt(searchParams.page || "1", 10);
  const limit = 50;
  const offset = (page - 1) * limit;

  const filters: GenerationFiltersInput = {
    worldId,
    limit,
    offset,
  };

  if (searchParams.entityId) {
    filters.entityId = searchParams.entityId;
  }

  if (searchParams.tool && isValidGenerationTool(searchParams.tool)) {
    filters.tool = searchParams.tool;
  }

  if (searchParams.status && isValidGenerationStatus(searchParams.status)) {
    filters.status = searchParams.status;
  }

  // Fetch generations
  const result = await getGenerationsAction(filters);
  const generations = result.success ? result.data : [];

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      {/* Back Button */}
      <div className="mb-6">
        <a
          href={`/worlds/${worldId}`}
          className="inline-flex items-center text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 transition-colors"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="mr-2"
          >
            <path d="m12 19-7-7 7-7" />
            <path d="M19 12H5" />
          </svg>
          Back to World
        </a>
      </div>

      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Generation History</h1>
        <p className="text-muted-foreground">
          View and manage all your AI-generated content for {world.name}
        </p>
      </div>

      <div className="space-y-6">
        {/* Filters */}
        <GenerationFilters
          worldId={worldId}
          entities={entitiesWithImages}
          currentFilters={searchParams}
        />

        {/* Generation List */}
        <GenerationHistory
          generations={generations}
          worldId={worldId}
          currentPage={page}
          hasMore={generations.length === limit}
        />
      </div>
    </div>
  );
}

export default async function HistoryPage({
  params,
  searchParams,
}: HistoryPageProps) {
  const { worldId } = await params;
  const resolvedSearchParams = await searchParams;

  return (
    <Suspense
      fallback={
        <div className="container mx-auto py-8 px-4 max-w-7xl">
          <Skeleton className="h-10 w-64 mb-2" />
          <Skeleton className="h-5 w-96 mb-8" />
          <div className="space-y-4">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-96 w-full" />
          </div>
        </div>
      }
    >
      <HistoryContent worldId={worldId} searchParams={resolvedSearchParams} />
    </Suspense>
  );
}
