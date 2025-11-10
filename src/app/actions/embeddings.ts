"use server";

import { revalidatePath } from "next/cache";
import { embeddingService } from "@/lib/ai";
import { vectorService } from "@/lib/vector";
import { entityService } from "@/lib/entities/entity-service";
import type { VectorMetadata } from "@/lib/vector";

/**
 * Result type for embedding generation
 */
interface EmbeddingGenerationResult {
  success: boolean;
  embeddingIds: string[];
  error?: string;
}

/**
 * Generate embeddings for an entity
 * Processes all entity images and description to create combined embeddings
 * Stores embeddings in Pinecone vector database
 * 
 * @param entityId - ID of the entity to generate embeddings for
 * @returns Result with success status and embedding IDs
 */
export async function generateEmbeddingsAction(
  entityId: string
): Promise<EmbeddingGenerationResult> {
  try {
    // Fetch entity with images
    const result = await entityService.getEntityById(entityId);

    if (!result) {
      return {
        success: false,
        embeddingIds: [],
        error: "Entity not found",
      };
    }

    const { entity, images } = result;
    const embeddingIds: string[] = [];

    // Prepare image URLs
    const imageUrls = images.map((img) => img.url);

    // Generate combined embedding (visual + semantic)
    if (imageUrls.length > 0 || entity.description) {
      try {
        const combinedEmbedding = await embeddingService.generateCombinedEmbedding(
          imageUrls.length > 0 ? imageUrls : null,
          entity.description || null,
          0.6, // 60% visual weight
          0.4  // 40% semantic weight
        );

        // Store combined embedding in Pinecone
        const combinedId = `${entityId}-combined`;
        const combinedMetadata: VectorMetadata = {
          entityId: entity.id,
          worldId: entity.worldId,
          branchId: entity.branchId || "",
          type: "combined",
          imageUrl: images.length > 0 ? images[0].url : "",
          text: entity.description,
          createdAt: new Date().toISOString(),
        };

        await vectorService.upsert([
          {
            id: combinedId,
            values: combinedEmbedding,
            metadata: combinedMetadata,
          },
        ]);

        embeddingIds.push(combinedId);
      } catch (error) {
        console.error("Error generating combined embedding:", error);
        throw error;
      }
    }

    // Generate individual visual embeddings for each image
    if (imageUrls.length > 0) {
      try {
        const visualEmbeddings = await embeddingService.generateVisualEmbeddingsBatch(
          imageUrls
        );

        // Store each visual embedding
        const visualVectors = visualEmbeddings.map((embedding, index) => {
          const visualId = `${entityId}-visual-${images[index].id}`;
          const visualMetadata: VectorMetadata = {
            entityId: entity.id,
            worldId: entity.worldId,
            branchId: entity.branchId || "",
            type: "visual",
            imageUrl: images[index].url,
            text: "",
            createdAt: new Date().toISOString(),
          };

          embeddingIds.push(visualId);

          return {
            id: visualId,
            values: embedding,
            metadata: visualMetadata,
          };
        });

        await vectorService.upsert(visualVectors);
      } catch (error) {
        console.error("Error generating visual embeddings:", error);
        // Continue even if visual embeddings fail
      }
    }

    // Generate semantic embedding from description
    if (entity.description && entity.description.trim().length > 0) {
      try {
        const semanticEmbedding = await embeddingService.generateTextEmbedding(
          entity.description
        );

        // Store semantic embedding
        const semanticId = `${entityId}-semantic`;
        const semanticMetadata: VectorMetadata = {
          entityId: entity.id,
          worldId: entity.worldId,
          branchId: entity.branchId || "",
          type: "semantic",
          imageUrl: "",
          text: entity.description,
          createdAt: new Date().toISOString(),
        };

        await vectorService.upsert([
          {
            id: semanticId,
            values: semanticEmbedding,
            metadata: semanticMetadata,
          },
        ]);

        embeddingIds.push(semanticId);
      } catch (error) {
        console.error("Error generating semantic embedding:", error);
        // Continue even if semantic embedding fails
      }
    }

    // Revalidate entity pages
    revalidatePath(`/worlds/${entity.worldId}/entities`);
    revalidatePath(`/worlds/${entity.worldId}/entities/${entityId}`);

    return {
      success: true,
      embeddingIds,
    };
  } catch (error) {
    console.error("Error in generateEmbeddingsAction:", error);
    return {
      success: false,
      embeddingIds: [],
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

/**
 * Search for similar entities using vector similarity
 * 
 * @param worldId - ID of the world to search in
 * @param query - Search query (text)
 * @param options - Search options
 * @returns Array of similar entities with scores
 */
export async function searchSimilarEntitiesAction(
  worldId: string,
  query: string,
  options: {
    topK?: number;
    type?: "visual" | "semantic" | "combined";
    branchId?: string;
  } = {}
): Promise<{
  success: boolean;
  results: Array<{
    entityId: string;
    score: number;
    metadata: VectorMetadata;
  }>;
  error?: string;
}> {
  try {
    const { topK = 10, type = "combined", branchId } = options;

    // Generate query embedding from text
    const queryEmbedding = await embeddingService.generateTextEmbedding(query);

    // Build filter for Pinecone query
    const filter: Record<string, string | number | boolean | string[]> = {
      worldId,
      type,
    };

    if (branchId !== undefined) {
      filter.branchId = branchId;
    }

    // Query Pinecone for similar vectors
    const results = await vectorService.query(queryEmbedding, {
      topK,
      filter,
      includeMetadata: true,
    });

    return {
      success: true,
      results: results.map((result) => ({
        entityId: result.metadata.entityId,
        score: result.score,
        metadata: result.metadata,
      })),
    };
  } catch (error) {
    console.error("Error in searchSimilarEntitiesAction:", error);
    return {
      success: false,
      results: [],
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

/**
 * Delete all embeddings for an entity
 * Should be called when an entity is deleted
 * 
 * @param entityId - ID of the entity to delete embeddings for
 * @returns Success status
 */
export async function deleteEntityEmbeddingsAction(
  entityId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await vectorService.deleteEntityVectors(entityId);

    return {
      success: true,
    };
  } catch (error) {
    console.error("Error in deleteEntityEmbeddingsAction:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

/**
 * Regenerate embeddings for an entity
 * Useful when entity images or description are updated
 * 
 * @param entityId - ID of the entity to regenerate embeddings for
 * @returns Result with success status and embedding IDs
 */
export async function regenerateEmbeddingsAction(
  entityId: string
): Promise<EmbeddingGenerationResult> {
  try {
    // Delete existing embeddings
    await vectorService.deleteEntityVectors(entityId);

    // Generate new embeddings
    return await generateEmbeddingsAction(entityId);
  } catch (error) {
    console.error("Error in regenerateEmbeddingsAction:", error);
    return {
      success: false,
      embeddingIds: [],
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}
