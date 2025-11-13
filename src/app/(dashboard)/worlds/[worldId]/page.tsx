import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DotPattern } from "@/components/ui/dot-pattern";
import { worldService } from "@/lib/worlds/world-service";
import { getCurrentUserId } from "@/lib/auth/session";
import { getBranchesAction } from "@/app/actions/branches";
import { BranchSelector } from "@/components/branches/branch-selector";
import { DashboardStats } from "@/components/worlds/dashboard-stats";
import { EntityBreakdown } from "@/components/worlds/entity-breakdown";
import { EntityCard } from "@/components/entities/entity-card";
import GenerationCard from "@/components/generations/generation-card";
import { ExportWorldDialog } from "@/components/worlds/export-world-dialog";
import { Layers, Plus, ArrowLeft, Sparkles, Clock, TrendingUp } from "lucide-react";

interface PageProps {
  params: Promise<{ worldId: string }>;
}

export default async function WorldDetailPage({ params }: PageProps) {
  const { worldId } = await params;

  const userId = await getCurrentUserId();
  if (!userId) {
    redirect("/");
  }

  // Fetch world
  const world = await worldService.getWorldById(worldId, userId);
  if (!world) {
    notFound();
  }

  // Fetch branches
  const branchesResult = await getBranchesAction(worldId);
  const branches = branchesResult.success ? branchesResult.data : [];

  // Fetch world statistics
  const stats = await worldService.getWorldStats(worldId, userId);
  if (!stats) {
    notFound();
  }

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
        <Link href="/worlds">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Worlds
        </Link>
      </Button>

      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
          <div className="flex-1">
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-3">
              {world.name}
            </h1>
            {world.description && (
              <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400 mb-4">
                {world.description}
              </p>
            )}
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <ExportWorldDialog worldId={worldId} worldName={world.name} />
            <BranchSelector worldId={worldId} branches={branches} />
          </div>
        </div>
        {world.tags && world.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {world.tags.map((tag) => (
              <Badge
                key={tag}
                variant="secondary"
                className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
              >
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* Statistics Cards */}
      <DashboardStats
        entityCount={stats.entityCount}
        generationCount={stats.generationCount}
        lastActivity={stats.lastActivity}
        worldId={worldId}
      />

      {/* Entity Breakdown and Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
        <div className="lg:col-span-1">
          <EntityBreakdown breakdown={stats.entityBreakdown} worldId={worldId} />
        </div>
        
        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          <Link
            href={`/worlds/${worldId}/entities/new`}
            className="group bg-white dark:bg-gray-900 border border-indigo-200 dark:border-indigo-800/50 rounded-2xl p-6 sm:p-8 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 active:scale-[0.98] touch-manipulation"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-full bg-indigo-50 dark:bg-indigo-950/30 flex items-center justify-center">
                <Layers className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
              </div>
              <Plus className="w-5 h-5 text-gray-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
              Create Entity
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Add characters, locations, objects, and styles
            </p>
          </Link>

          <Link
            href={`/worlds/${worldId}/generate`}
            className="group bg-white dark:bg-gray-900 border border-purple-200 dark:border-purple-800/50 rounded-2xl p-6 sm:p-8 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 active:scale-[0.98] touch-manipulation"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-full bg-purple-50 dark:bg-purple-950/30 flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <Plus className="w-5 h-5 text-gray-400 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
              Generate Content
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Create AI-generated content with prompt enhancement
            </p>
          </Link>

          <Link
            href={`/worlds/${worldId}/entities`}
            className="group bg-white dark:bg-gray-900 border border-green-200 dark:border-green-800/50 rounded-2xl p-6 sm:p-8 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 active:scale-[0.98] touch-manipulation"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-full bg-green-50 dark:bg-green-950/30 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
              View All Entities
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Browse and manage all entities in this world
            </p>
          </Link>

          <Link
            href={`/worlds/${worldId}/history`}
            className="group bg-white dark:bg-gray-900 border border-amber-200 dark:border-amber-800/50 rounded-2xl p-6 sm:p-8 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 active:scale-[0.98] touch-manipulation"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-full bg-amber-50 dark:bg-amber-950/30 flex items-center justify-center">
                <Clock className="w-6 h-6 text-amber-600 dark:text-amber-400" />
              </div>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
              View History
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              See all past generations and their results
            </p>
          </Link>
        </div>
      </div>

      {/* Recent Entities */}
      {stats.recentEntities.length > 0 && (
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 sm:mb-6">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">
              Recent Entities
            </h2>
            <Button asChild variant="outline" className="w-full sm:w-auto">
              <Link href={`/worlds/${worldId}/entities`}>
                View All
              </Link>
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {stats.recentEntities.slice(0, 4).map((entity) => (
              <EntityCard key={entity.id} entity={entity} worldId={worldId} />
            ))}
          </div>
        </div>
      )}

      {/* Recent Generations */}
      {stats.recentGenerations.length > 0 && (
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 sm:mb-6">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">
              Recent Generations
            </h2>
            <Button asChild variant="outline" className="w-full sm:w-auto">
              <Link href={`/worlds/${worldId}/history`}>
                View All
              </Link>
            </Button>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            {stats.recentGenerations.slice(0, 4).map((generation) => (
              <GenerationCard key={generation.id} generation={generation} worldId={worldId} />
            ))}
          </div>
        </div>
      )}
    </div>
    </div>
  );
}
