import { notFound, redirect } from "next/navigation";
import { getCurrentUserId } from "@/lib/auth/session";
import { generationService } from "@/lib/generations/generation-service";
import { entityService } from "@/lib/entities/entity-service";
import { consistencyService } from "@/lib/consistency/consistency-service";
import ConsistencyAnalysisWrapper from "@/components/generations/consistency-analysis-wrapper";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

interface GenerationDetailPageProps {
  params: Promise<{
    worldId: string;
    generationId: string;
  }>;
}

export default async function GenerationDetailPage({
  params,
}: GenerationDetailPageProps) {
  const { worldId, generationId } = await params;
  
  // Check authentication
  const userId = await getCurrentUserId();
  if (!userId) {
    redirect("/login");
  }

  // Fetch generation
  const generation = await generationService.getGenerationById(generationId);
  if (!generation || generation.userId !== userId) {
    notFound();
  }

  // Check if generation has consistency score and result URL
  if (!generation.consistencyScore || !generation.resultUrl) {
    return (
      <div className="container max-w-6xl py-8">
        <div className="mb-6">
          <Link href={`/worlds/${worldId}/history`}>
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to History
            </Button>
          </Link>
        </div>
        <div className="text-center py-12">
          <h2 className="text-2xl font-semibold mb-2">No Consistency Analysis Available</h2>
          <p className="text-muted-foreground">
            This generation doesn't have consistency analysis yet.
            {!generation.resultUrl && " Please add a result URL first."}
          </p>
        </div>
      </div>
    );
  }

  // Fetch entities used in generation
  const entitiesWithImages = await Promise.all(
    generation.entityIds.map(async (entityId) => {
      const entity = await entityService.getEntityById(entityId);
      if (!entity) return null;
      
      const images = await entityService.getEntityImages(entityId);
      return {
        ...entity,
        images,
      };
    })
  );

  const validEntities = entitiesWithImages.filter((e) => e !== null);

  // Perform consistency analysis if not already done
  let analysis;
  try {
    analysis = await consistencyService.analyzeConsistency(
      generationId,
      generation.resultUrl,
      "image"
    );
  } catch (error) {
    console.error("Error analyzing consistency:", error);
    return (
      <div className="container max-w-6xl py-8">
        <div className="mb-6">
          <Link href={`/worlds/${worldId}/history`}>
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to History
            </Button>
          </Link>
        </div>
        <div className="text-center py-12">
          <h2 className="text-2xl font-semibold mb-2">Analysis Error</h2>
          <p className="text-muted-foreground">
            Failed to analyze consistency. Please try again later.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-6xl py-8">
      {/* Header */}
      <div className="mb-6">
        <Link href={`/worlds/${worldId}/history`}>
          <Button variant="ghost" size="sm" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to History
          </Button>
        </Link>
      </div>

      {/* Page Title */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Consistency Analysis</h1>
        <p className="text-muted-foreground">
          Detailed analysis of generated content vs. entity references
        </p>
      </div>

      {/* Consistency Analysis Wrapper */}
      <ConsistencyAnalysisWrapper
        generationId={generationId}
        worldId={worldId}
        analysis={analysis}
        generatedContentUrl={generation.resultUrl}
        referenceEntities={validEntities}
      />
    </div>
  );
}
