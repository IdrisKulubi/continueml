import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DotPattern } from "@/components/ui/dot-pattern";
import { worldService } from "@/lib/worlds/world-service";
import { getCurrentUserId } from "@/lib/auth/session";
import { Layers, Plus, ArrowLeft } from "lucide-react";

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
        {/* Back Button */}
        <Button asChild variant="ghost" className="mb-6">
        <Link href="/worlds">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Worlds
        </Link>
      </Button>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-3">
          {world.name}
        </h1>
        {world.description && (
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-4">
            {world.description}
          </p>
        )}
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

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Link
          href={`/worlds/${worldId}/entities`}
          className="group bg-white dark:bg-gray-900 border border-indigo-200 dark:border-indigo-800/50 rounded-2xl p-8 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-full bg-indigo-50 dark:bg-indigo-950/30 flex items-center justify-center">
              <Layers className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            </div>
            <Plus className="w-5 h-5 text-gray-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
            Entities
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Manage characters, locations, objects, and styles
          </p>
        </Link>

        {/* Placeholder for future features */}
        <div className="bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 rounded-2xl p-8 opacity-50">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
              <span className="text-2xl">🎬</span>
            </div>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
            Generations
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Coming soon
          </p>
        </div>

        <div className="bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 rounded-2xl p-8 opacity-50">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
              <span className="text-2xl">📚</span>
            </div>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
            World Bible
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Coming soon
          </p>
        </div>
      </div>
    </div>
    </div>
  );
}
