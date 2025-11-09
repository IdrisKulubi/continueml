import { notFound } from "next/navigation";
import { worldService } from "@/lib/worlds/world-service";
import { getCurrentUserId } from "@/lib/auth/session";
import { DotPattern } from "@/components/ui/dot-pattern";
import { EntityForm } from "@/components/entities/entity-form";

interface PageProps {
  params: Promise<{ worldId: string }>;
}

export default async function NewEntityPage({ params }: PageProps) {
  const { worldId } = await params;

  const userId = await getCurrentUserId();
  if (!userId) {
    notFound();
  }

  // Verify world ownership
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
      <div className="relative z-10 container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Create Entity
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Add a new character, location, object, or style to your world
          </p>
        </div>

        {/* Form */}
        <EntityForm worldId={worldId} />
      </div>
    </div>
  );
}
