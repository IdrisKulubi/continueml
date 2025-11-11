import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getCurrentUserId } from "@/lib/auth/session";
import { worldService } from "@/lib/worlds/world-service";
import { getBranchesAction } from "@/app/actions/branches";
import { BranchCard } from "@/components/branches/branch-card";
import { Button } from "@/components/ui/button";
import { GitBranch, Plus } from "lucide-react";
import { CreateBranchDialog } from "@/components/branches/create-branch-dialog";
import { Skeleton } from "@/components/ui/skeleton";

interface BranchesPageProps {
  params: {
    worldId: string;
  };
}

async function BranchesContent({ worldId }: { worldId: string }) {
  const userId = await getCurrentUserId();
  if (!userId) {
    notFound();
  }

  // Verify world ownership
  const world = await worldService.getWorldById(worldId, userId);
  if (!world) {
    notFound();
  }

  // Get all branches
  const result = await getBranchesAction(worldId);
  const branches = result.success ? result.data : [];

  // Create a map of branch IDs to names for parent lookup
  const branchMap = new Map(branches.map((b) => [b.id, b.name]));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Branches
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage alternate versions of your world
          </p>
        </div>
      </div>

      {/* Main branch card */}
      <div className="bg-white dark:bg-gray-900 border border-indigo-200 dark:border-indigo-800/50 rounded-2xl p-6 shadow-[0_8px_30px_rgba(0,0,0,0.08)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.3)]">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <GitBranch className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              <h3 className="text-xl font-semibold text-indigo-600 dark:text-indigo-400">
                Main
              </h3>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              The primary version of your world. All branches are created from this or other branches.
            </p>
          </div>
        </div>
      </div>

      {/* Branches list */}
      {branches.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2">
          {branches.map((branch) => (
            <BranchCard
              key={branch.id}
              branch={branch}
              parentBranchName={
                branch.parentBranchId
                  ? branchMap.get(branch.parentBranchId) || "Unknown"
                  : "Main"
              }
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-white dark:bg-gray-900 border border-dashed border-gray-300 dark:border-gray-700 rounded-2xl">
          <GitBranch className="h-12 w-12 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
            No branches yet
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
            Create a branch to experiment with different creative directions without
            affecting your main world.
          </p>
        </div>
      )}
    </div>
  );
}

function BranchesLoading() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Skeleton className="h-9 w-32 mb-2" />
          <Skeleton className="h-5 w-64" />
        </div>
      </div>
      <Skeleton className="h-32 w-full rounded-2xl" />
      <div className="grid gap-6 md:grid-cols-2">
        <Skeleton className="h-48 w-full rounded-2xl" />
        <Skeleton className="h-48 w-full rounded-2xl" />
      </div>
    </div>
  );
}

export default function BranchesPage({ params }: BranchesPageProps) {
  return (
    <Suspense fallback={<BranchesLoading />}>
      <BranchesContent worldId={params.worldId} />
    </Suspense>
  );
}
