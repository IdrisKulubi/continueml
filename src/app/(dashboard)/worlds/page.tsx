import { Suspense } from "react";
import { getWorldsAction } from "@/app/actions/worlds";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { DotPattern } from "@/components/ui/dot-pattern";
import { Plus, Globe } from "lucide-react";
import { WorldCard } from "@/components/worlds/world-card";
import { CreateWorldDialog } from "@/components/worlds/create-world-dialog";

async function WorldsList() {
  const result = await getWorldsAction(false);

  if (!result.success) {
    return (
      <div className="text-center py-16">
        <p className="text-red-600 dark:text-red-400 font-medium">{result.error}</p>
      </div>
    );
  }

  const worlds = result.data;

  if (worlds.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="rounded-full bg-linear-to-br from-indigo-200 to-purple-100 dark:from-indigo-900/40 dark:to-purple-900/40 p-8 mb-6 shadow-lg">
          <Globe className="h-16 w-16 text-indigo-500 dark:text-indigo-400" strokeWidth={1.5} />
        </div>
        <h3 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-3">No worlds yet</h3>
        <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md text-base leading-relaxed">
          Create your first world to start building your creative universe with AI-powered memory.
        </p>
        <CreateWorldDialog>
          <Button className="bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white font-medium px-6 py-3 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5">
            <Plus className="mr-2 h-5 w-5" />
            Create Your First World
          </Button>
        </CreateWorldDialog>
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {worlds.map((world) => (
        <WorldCard key={world.id} world={world} />
      ))}
    </div>
  );
}

function WorldsListSkeleton() {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 shadow-sm">
          <Skeleton className="h-7 w-3/4 mb-4 rounded-md" />
          <Skeleton className="h-4 w-full mb-2 rounded-md" />
          <Skeleton className="h-4 w-5/6 mb-6 rounded-md" />
          <div className="flex gap-4">
            <Skeleton className="h-4 w-20 rounded-md" />
            <Skeleton className="h-4 w-28 rounded-md" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function WorldsPage() {
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
      <div className="relative z-10 container max-w-7xl mx-auto py-10 px-6">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2">Worlds</h1>
            <p className="text-gray-500 dark:text-gray-400 text-base">
              Manage your creative worlds and projects
            </p>
          </div>
          <CreateWorldDialog>
            <Button className="bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white font-medium px-5 py-2.5 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5">
              <Plus className="mr-2 h-5 w-5" />
              Create World
            </Button>
          </CreateWorldDialog>
        </div>

        <Suspense fallback={<WorldsListSkeleton />}>
          <WorldsList />
        </Suspense>
      </div>
    </div>
  );
}
