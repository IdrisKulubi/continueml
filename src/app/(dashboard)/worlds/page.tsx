import { Suspense } from "react";
import { getWorldsAction } from "@/app/actions/worlds";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus } from "lucide-react";
import { WorldCard } from "@/components/worlds/world-card";
import { CreateWorldDialog } from "@/components/worlds/create-world-dialog";

async function WorldsList() {
  const result = await getWorldsAction(false);

  if (!result.success) {
    return (
      <div className="text-center py-12">
        <p className="text-destructive">{result.error}</p>
      </div>
    );
  }

  const worlds = result.data;

  if (worlds.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="rounded-full bg-muted p-6 mb-4">
          <svg
            className="h-12 w-12 text-muted-foreground"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <h3 className="text-lg font-semibold mb-2">No worlds yet</h3>
        <p className="text-muted-foreground mb-6 max-w-sm">
          Create your first world to start building your creative universe with AI-powered memory.
        </p>
        <CreateWorldDialog>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
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
        <div key={i} className="rounded-lg border bg-card p-6">
          <Skeleton className="h-6 w-3/4 mb-3" />
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-5/6 mb-4" />
          <div className="flex gap-4 text-sm">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-24" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function WorldsPage() {
  return (
    <div className="container py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Worlds</h1>
          <p className="text-muted-foreground mt-2">
            Manage your creative worlds and projects
          </p>
        </div>
        <CreateWorldDialog>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
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
