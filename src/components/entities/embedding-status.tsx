"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Sparkles, RefreshCw } from "lucide-react";
import { regenerateEmbeddingsAction } from "@/app/actions/embeddings";
import { toast } from "sonner";

interface EmbeddingStatusProps {
  entityId: string;
  hasImages: boolean;
  hasDescription: boolean;
}

export function EmbeddingStatus({
  entityId,
  hasImages,
  hasDescription,
}: EmbeddingStatusProps) {
  const [isRegenerating, setIsRegenerating] = useState(false);

  const handleRegenerate = async () => {
    setIsRegenerating(true);
    try {
      const result = await regenerateEmbeddingsAction(entityId);
      
      if (result.success) {
        if (result.embeddingIds.length > 0) {
          toast.success("Embeddings generated successfully", {
            description: `Created ${result.embeddingIds.length} embedding${result.embeddingIds.length > 1 ? 's' : ''}`,
          });
        } else {
          toast.info("No embeddings to generate", {
            description: "Add images or a description to enable embeddings",
          });
        }
      } else {
        toast.error("Failed to generate embeddings", {
          description: result.error || "Unknown error occurred",
        });
      }
    } catch (error) {
      toast.error("Failed to generate embeddings", {
        description: error instanceof Error ? error.message : "Unknown error",
      });
    } finally {
      setIsRegenerating(false);
    }
  };

  const canGenerateEmbeddings = hasImages || hasDescription;

  return (
    <section>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
        AI Embeddings
      </h3>
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-indigo-500" aria-hidden="true" />
            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
              Status
            </span>
          </div>
          {canGenerateEmbeddings ? (
            <Badge variant="secondary" className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-0">
              Active
            </Badge>
          ) : (
            <Badge variant="secondary" className="bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-0">
              Pending
            </Badge>
          )}
        </div>

        <p className="text-sm text-gray-600 dark:text-gray-400">
          {canGenerateEmbeddings
            ? "Embeddings are generated automatically from your images and description for similarity search and consistency checking."
            : "Add images or a description to enable AI embeddings."}
        </p>

        {canGenerateEmbeddings && (
          <div className="pt-2">
            <Button
              onClick={handleRegenerate}
              disabled={isRegenerating}
              variant="outline"
              size="sm"
              className="w-full"
            >
              {isRegenerating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" aria-hidden="true" />
                  Generating...
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4 mr-2" aria-hidden="true" />
                  Generate Embeddings
                </>
              )}
            </Button>
          </div>
        )}

        <div className="pt-2 space-y-2 text-xs text-gray-500 dark:text-gray-500">
          <div className="flex items-center justify-between">
            <span>Visual embeddings:</span>
            <span className="font-medium">{hasImages ? "✓ Enabled" : "✗ Disabled"}</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Semantic embeddings:</span>
            <span className="font-medium">{hasDescription ? "✓ Enabled" : "✗ Disabled"}</span>
          </div>
        </div>
      </div>
    </section>
  );
}
