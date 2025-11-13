import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { DotPattern } from "@/components/ui/dot-pattern";
import { Plus, ArrowLeft } from "lucide-react";
import { getBranchesAction } from "@/app/actions/branches";
import { worldService } from "@/lib/worlds/world-service";
import { getCurrentUserId } from "@/lib/auth/session";
import { EntitySearchFilters } from "@/components/entities/entity-search-filters";
import { BranchSelector } from "@/components/branches/branch-selector";
import { EntitiesListWrapper } from "@/components/entities/entities-list-wrapper";
import type { EntityType } from "@/types";

interface PageProps {
  params: Promise<{ worldId: string }>;
  searchParams: Promise<{
    type?: EntityType;
    tags?: string;
    search?: string;
  }>;
}



export default async function EntitiesPage({ params, searchParams }: PageProps) {
  const { worldId } = await params;
  const resolvedSearchParams = await searchParams;

  // Verify world ownership
  const userId = await getCurrentUserId();
  if (!userId) {
    notFound();
  }

  const world = await worldService.getWorldById(worldId, userId);
  if (!world) {
    notFound();
  }

  // Fetch branches for selector
  const branchesResult = await getBranchesAction(worldId);
  const branches = branchesResult.success ? branchesResult.data : [];

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
      <div className="relative z-10 container mx-auto px-4 py-6 sm:py-8 max-w-7xl">
        {/* Back Button */}
        <Button asChild variant="ghost" className="mb-4 sm:mb-6">
          <Link href={`/worlds/${worldId}`}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to World
          </Link>
        </Button>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8">
          <div className="flex-1">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              Entities
            </h1>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
              Manage characters, locations, objects, and styles for your world
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <BranchSelector worldId={worldId} branches={branches} />
            <Button asChild className="w-full sm:w-auto">
              <Link href={`/worlds/${worldId}/entities/new`}>
                <Plus className="w-4 h-4 mr-2" />
                Create Entity
              </Link>
            </Button>
          </div>
        </div>

        {/* Search and Filters */}
        <EntitySearchFilters worldId={worldId} />

        {/* Entities List */}
        <EntitiesListWrapper worldId={worldId} searchParams={resolvedSearchParams} />
      </div>
    </div>
  );
}
