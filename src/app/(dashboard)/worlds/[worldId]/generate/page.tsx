import { Suspense } from "react";
import { notFound } from "next/navigation";
import { auth } from "../../../../../../auth";
import { worldService } from "@/lib/worlds/world-service";
import { entityService } from "@/lib/entities/entity-service";
import { getBranchesAction } from "@/app/actions/branches";
import GenerationInterface from "@/components/generations/generation-interface";
import { BranchSelector } from "@/components/branches/branch-selector";
import { Skeleton } from "@/components/ui/skeleton";

interface GeneratePageProps {
  params: Promise<{
    worldId: string;
  }>;
}

async function GenerateContent({ worldId }: { worldId: string }) {
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

  // Get all entities for this world (for entity selector)
  const entitiesWithImages = await entityService.getEntities(worldId, {
    isArchived: false,
  });

  // Fetch branches for selector
  const branchesResult = await getBranchesAction(worldId);
  const branches = branchesResult.success ? branchesResult.data : [];

  return (
    <div className="container mx-auto py-8 px-4 max-w-5xl">
      <div className="mb-8">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h1 className="text-3xl font-bold mb-2">Generate Content</h1>
            <p className="text-muted-foreground">
              Create AI-generated content with automatic prompt enhancement using your world&apos;s entities
            </p>
          </div>
          <BranchSelector worldId={worldId} branches={branches} />
        </div>
      </div>

      <GenerationInterface
        worldId={worldId}
        userId={session.user.id}
        entities={entitiesWithImages}
      />
    </div>
  );
}

export default async function GeneratePage({ params }: GeneratePageProps) {
  const { worldId } = await params;

  return (
    <Suspense
      fallback={
        <div className="container mx-auto py-8 px-4 max-w-5xl">
          <Skeleton className="h-10 w-64 mb-2" />
          <Skeleton className="h-5 w-96 mb-8" />
          <Skeleton className="h-96 w-full" />
        </div>
      }
    >
      <GenerateContent worldId={worldId} />
    </Suspense>
  );
}
