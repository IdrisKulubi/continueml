"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import ConsistencyAnalysisView from "./consistency-analysis-view";
import type { ConsistencyAnalysis } from "@/lib/consistency/consistency-service";
import type { Entity, EntityImage } from "@/types";
import {
  regenerateWithConstraintsAction,
  updateEntityMemoryAction,
  createVariantEntityAction,
} from "@/app/actions/consistency";

interface ConsistencyAnalysisWrapperProps {
  generationId: string;
  worldId: string;
  analysis: ConsistencyAnalysis;
  generatedContentUrl: string;
  referenceEntities: Array<Entity & { images: EntityImage[] }>;
}

export default function ConsistencyAnalysisWrapper({
  generationId,
  worldId,
  analysis,
  generatedContentUrl,
  referenceEntities,
}: ConsistencyAnalysisWrapperProps) {
  const router = useRouter();

  const handleRegenerate = async () => {
    try {
      const result = await regenerateWithConstraintsAction({
        generationId,
      });

      if (result.success) {
        toast.success("Regeneration initiated with stricter constraints");
        router.push(`/worlds/${worldId}/history`);
        router.refresh();
      } else {
        toast.error(result.error || "Failed to regenerate");
      }
    } catch (error) {
      console.error("Error regenerating:", error);
      toast.error("An unexpected error occurred");
    }
  };

  const handleUpdateMemory = async () => {
    if (referenceEntities.length === 0) {
      toast.error("No entities to update");
      return;
    }

    try {
      const result = await updateEntityMemoryAction({
        generationId,
        entityId: referenceEntities[0].id,
        contentUrl: generatedContentUrl,
      });

      if (result.success) {
        toast.success(result.data.message);
        router.refresh();
      } else {
        toast.error(result.error || "Failed to update entity memory");
      }
    } catch (error) {
      console.error("Error updating memory:", error);
      toast.error("An unexpected error occurred");
    }
  };

  const handleCreateVariant = async () => {
    if (referenceEntities.length === 0) {
      toast.error("No source entity available");
      return;
    }

    try {
      const result = await createVariantEntityAction({
        generationId,
        sourceEntityId: referenceEntities[0].id,
        contentUrl: generatedContentUrl,
      });

      if (result.success) {
        toast.success(result.data.message);
        router.refresh();
      } else {
        toast.error(result.error || "Failed to create variant entity");
      }
    } catch (error) {
      console.error("Error creating variant:", error);
      toast.error("An unexpected error occurred");
    }
  };

  return (
    <ConsistencyAnalysisView
      analysis={analysis}
      generatedContentUrl={generatedContentUrl}
      referenceEntities={referenceEntities}
      onRegenerate={handleRegenerate}
      onUpdateMemory={handleUpdateMemory}
      onCreateVariant={handleCreateVariant}
    />
  );
}
