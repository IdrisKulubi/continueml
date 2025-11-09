import { Suspense } from "react";
import { getWorldsAction } from "@/app/actions/worlds";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Globe } from "lucide-react";
import { WorldCard } from "@/components/worlds/world-card";
import { CreateWorldDialog } from "@/components/worlds/create-world-dialog";

async function WorldsList() {
  const result = await getWorldsAction(false);

  if (!result.success) {
    return (
      <div className="text-center py-16">
        <p className="text-red-600 font-medium">{result.error}</p>
      </div>
    );
  }

  const worlds = result.data;

  if (worlds.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="rounded-full bg-gradient-to-br from-indigo-50 to-purple-50 p-8 mb-6">
          <Globe className="h-16 w-16 text-indigo-400" strokeWidth={1.5} />
        </div>
        <h3 className="text-2xl font-semibold text-gray-900 mb-3">No worlds yet</h3>
        <p className="text-gray-500 mb-8 max-w-md text-base leading-relaxed">
          Create your first world to start building your creative universe with AI-powered memory.
        </p>
        <CreateWorldDialog>
          <Button className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-6 py-3 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5">
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
        <div key={i} className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
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
    <div className="container max-w-7xl mx-auto py-10 px-6">
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Worlds</h1>
          <p className="text-gray-500 text-base">
            Manage your creative worlds and projects
          </p>
        </div>
        <CreateWorldDialog>
          <Button className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-5 py-2.5 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5">
            <Plus className="mr-2 h-5 w-5" />
            Create World
          </Button>
        </CreateWorldDialog>
      </div>

      <Suspense fallback={<WorldsListSkeleton />}>
        <WorldsList />
      </Suspense>
    </div>
  );
}
