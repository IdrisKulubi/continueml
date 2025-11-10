"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { generationService } from "@/lib/generations/generation-service";
import { worldService } from "@/lib/worlds/world-service";
import { getCurrentUserId } from "@/lib/auth/session";
import { consistencyService } from "@/lib/consistency/consistency-service";
import { shouldNotifyConsistency } from "@/lib/utils/notifications";
import type { Generation, GenerationFilters } from "@/types";

// ============================================================================
// Validation Schemas
// ============================================================================

const generationToolEnum = z.enum([
  "runway",
  "midjourney",
  "stable_diffusion",
  "other",
]);

const generationStatusEnum = z.enum([
  "queued",
  "processing",
  "completed",
  "failed",
]);

const createGenerationSchema = z.object({
  prompt: z.string().min(1, "Prompt is required").max(5000, "Prompt is too long"),
  entityIds: z.array(z.string().uuid()).optional(),
  tool: generationToolEnum,
  branchId: z.string().uuid().optional(),
});

const generationFiltersSchema = z.object({
  worldId: z.string().uuid().optional(),
  userId: z.string().optional(),
  entityId: z.string().uuid().optional(),
  status: generationStatusEnum.optional(),
  tool: generationToolEnum.optional(),
  branchId: z.string().uuid().optional().nullable(),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  limit: z.number().min(1).max(100).optional(),
  offset: z.number().min(0).optional(),
});

const updateGenerationStatusSchema = z.object({
  status: generationStatusEnum,
  resultUrl: z.string().url().optional(),
  errorMessage: z.string().optional(),
});

// ============================================================================
// Action Response Types
// ============================================================================

type ActionResponse<T> =
  | { success: true; data: T }
  | { success: false; error: { message: string } };

// ============================================================================
// Server Actions
// ============================================================================

/**
 * Create a new generation with prompt enhancement
 */
export async function createGenerationAction(input: {
  worldId: string;
  userId: string;
  originalPrompt: string;
  entityIds?: string[];
  tool: string;
  branchId?: string;
}): Promise<
  ActionResponse<{
    generation: Generation;
    originalPrompt: string;
    enhancedPrompt: string;
  }>
> {
  try {
    // Get current user
    const userId = await getCurrentUserId();
    if (!userId) {
      return { success: false, error: { message: "Unauthorized" } };
    }

    // Verify user matches
    if (userId !== input.userId) {
      return { success: false, error: { message: "Unauthorized" } };
    }

    // Verify world ownership
    const world = await worldService.getWorldById(input.worldId, userId);
    if (!world) {
      return { success: false, error: { message: "World not found" } };
    }

    // Validate input
    const validatedData = createGenerationSchema.parse({
      prompt: input.originalPrompt,
      entityIds: input.entityIds,
      tool: input.tool,
      branchId: input.branchId,
    });

    // Enhance prompt with entity attributes
    const enhancementResult = await generationService.enhancePrompt(
      validatedData.prompt,
      input.worldId,
      validatedData.entityIds
    );

    // Create generation
    const generation = await generationService.createGeneration({
      worldId: input.worldId,
      branchId: validatedData.branchId,
      userId,
      originalPrompt: enhancementResult.originalPrompt,
      enhancedPrompt: enhancementResult.enhancedPrompt,
      entityIds: enhancementResult.detectedEntityIds,
      tool: validatedData.tool,
    });

    // Revalidate relevant paths
    revalidatePath(`/worlds/${input.worldId}/history`);
    revalidatePath(`/worlds/${input.worldId}/generate`);
    revalidatePath(`/worlds/${input.worldId}`);

    return {
      success: true,
      data: {
        generation,
        originalPrompt: enhancementResult.originalPrompt,
        enhancedPrompt: enhancementResult.enhancedPrompt,
      },
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: { message: error.issues[0].message } };
    }
    console.error("Error creating generation:", error);
    return { success: false, error: { message: "Failed to create generation" } };
  }
}

/**
 * Get generations with filtering
 */
export async function getGenerationsAction(
  filters?: GenerationFilters
): Promise<ActionResponse<Generation[]>> {
  try {
    // Get current user
    const userId = await getCurrentUserId();
    if (!userId) {
      return { success: false, error: { message: "Unauthorized" } };
    }

    // Validate filters if provided
    const validatedFilters = filters
      ? generationFiltersSchema.parse(filters)
      : {};

    // Add userId to filters to ensure users only see their own generations
    const filtersWithUser = {
      ...validatedFilters,
      userId,
    };

    // If worldId is provided, verify ownership
    if (filtersWithUser.worldId) {
      const world = await worldService.getWorldById(
        filtersWithUser.worldId,
        userId
      );
      if (!world) {
        return { success: false, error: { message: "World not found" } };
      }
    }

    // Get generations
    const generations = await generationService.getGenerations(filtersWithUser);

    return { success: true, data: generations };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: { message: error.issues[0].message } };
    }
    console.error("Error fetching generations:", error);
    return { success: false, error: { message: "Failed to fetch generations" } };
  }
}

/**
 * Get a generation by ID
 */
export async function getGenerationByIdAction(
  generationId: string
): Promise<ActionResponse<Generation>> {
  try {
    // Get current user
    const userId = await getCurrentUserId();
    if (!userId) {
      return { success: false, error: { message: "Unauthorized" } };
    }

    // Get generation
    const generation = await generationService.getGenerationById(generationId);
    if (!generation) {
      return { success: false, error: { message: "Generation not found" } };
    }

    // Verify ownership
    if (generation.userId !== userId) {
      return { success: false, error: { message: "Unauthorized" } };
    }

    return { success: true, data: generation };
  } catch (error) {
    console.error("Error fetching generation:", error);
    return { success: false, error: { message: "Failed to fetch generation" } };
  }
}

/**
 * Update generation status
 */
export async function updateGenerationStatusAction(
  generationId: string,
  formData: FormData
): Promise<ActionResponse<Generation>> {
  try {
    // Get current user
    const userId = await getCurrentUserId();
    if (!userId) {
      return { success: false, error: { message: "Unauthorized" } };
    }

    // Get generation to verify ownership
    const generation = await generationService.getGenerationById(generationId);
    if (!generation) {
      return { success: false, error: { message: "Generation not found" } };
    }

    // Verify ownership
    if (generation.userId !== userId) {
      return { success: false, error: { message: "Unauthorized" } };
    }

    // Parse and validate form data
    const rawData = {
      status: formData.get("status"),
      resultUrl: formData.get("resultUrl") || undefined,
      errorMessage: formData.get("errorMessage") || undefined,
    };

    const validatedData = updateGenerationStatusSchema.parse(rawData);

    // Update generation status
    const updatedGeneration = await generationService.updateGenerationStatus(
      generationId,
      validatedData.status,
      validatedData.resultUrl,
      validatedData.errorMessage
    );

    if (!updatedGeneration) {
      return { success: false, error: { message: "Generation not found" } };
    }

    // If generation completed successfully with a result URL, automatically check consistency
    if (
      validatedData.status === "completed" &&
      validatedData.resultUrl &&
      generation.entityIds &&
      generation.entityIds.length > 0
    ) {
      try {
        // Perform consistency analysis in the background
        const analysis = await consistencyService.analyzeConsistency(
          generationId,
          validatedData.resultUrl,
          "image" // Default to image, could be enhanced to detect type
        );

        // Update generation with consistency score
        await consistencyService.updateGenerationConsistency(
          generationId,
          analysis.overallScore
        );

        // Flag low consistency generations for user notification
        if (shouldNotifyConsistency(analysis.overallScore)) {
          console.warn(
            `Low consistency detected for generation ${generationId}: ${analysis.overallScore}% - ${analysis.message}`
          );
        }
      } catch (consistencyError) {
        // Log error but don't fail the status update
        console.error(
          "Error checking consistency (non-blocking):",
          consistencyError
        );
      }
    }

    // Revalidate relevant paths
    revalidatePath(`/worlds/${generation.worldId}/history`);
    revalidatePath(`/worlds/${generation.worldId}/generate`);

    return { success: true, data: updatedGeneration };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: { message: error.issues[0].message } };
    }
    console.error("Error updating generation status:", error);
    return { success: false, error: { message: "Failed to update generation status" } };
  }
}

/**
 * Retry a failed generation
 */
export async function retryGenerationAction(
  generationId: string
): Promise<ActionResponse<Generation>> {
  try {
    // Get current user
    const userId = await getCurrentUserId();
    if (!userId) {
      return { success: false, error: { message: "Unauthorized" } };
    }

    // Get generation to verify ownership
    const generation = await generationService.getGenerationById(generationId);
    if (!generation) {
      return { success: false, error: { message: "Generation not found" } };
    }

    // Verify ownership
    if (generation.userId !== userId) {
      return { success: false, error: { message: "Unauthorized" } };
    }

    // Retry generation
    const newGeneration = await generationService.retryGeneration(generationId);

    if (!newGeneration) {
      return { success: false, error: { message: "Failed to retry generation" } };
    }

    // Revalidate relevant paths
    revalidatePath(`/worlds/${generation.worldId}/history`);
    revalidatePath(`/worlds/${generation.worldId}/generate`);

    return { success: true, data: newGeneration };
  } catch (error) {
    console.error("Error retrying generation:", error);
    return { success: false, error: { message: "Failed to retry generation" } };
  }
}

/**
 * Delete a generation
 */
export async function deleteGenerationAction(
  generationId: string
): Promise<ActionResponse<{ message: string }>> {
  try {
    // Get current user
    const userId = await getCurrentUserId();
    if (!userId) {
      return { success: false, error: { message: "Unauthorized" } };
    }

    // Get generation to verify ownership
    const generation = await generationService.getGenerationById(generationId);
    if (!generation) {
      return { success: false, error: { message: "Generation not found" } };
    }

    // Verify ownership
    if (generation.userId !== userId) {
      return { success: false, error: { message: "Unauthorized" } };
    }

    // Delete generation
    await generationService.deleteGeneration(generationId);

    // Revalidate relevant paths
    revalidatePath(`/worlds/${generation.worldId}/history`);
    revalidatePath(`/worlds/${generation.worldId}`);

    return {
      success: true,
      data: { message: "Generation deleted successfully" },
    };
  } catch (error) {
    console.error("Error deleting generation:", error);
    return { success: false, error: { message: "Failed to delete generation" } };
  }
}

/**
 * Enhance a prompt without creating a generation (for preview)
 */
export async function enhancePromptAction(
  worldId: string,
  prompt: string,
  entityIds?: string[]
): Promise<
  ActionResponse<{
    originalPrompt: string;
    enhancedPrompt: string;
    detectedEntityIds: string[];
  }>
> {
  try {
    // Get current user
    const userId = await getCurrentUserId();
    if (!userId) {
      return { success: false, error: { message: "Unauthorized" } };
    }

    // Verify world ownership
    const world = await worldService.getWorldById(worldId, userId);
    if (!world) {
      return { success: false, error: { message: "World not found" } };
    }

    // Validate prompt
    if (!prompt || prompt.trim().length === 0) {
      return { success: false, error: { message: "Prompt is required" } };
    }

    // Enhance prompt
    const result = await generationService.enhancePrompt(
      prompt,
      worldId,
      entityIds
    );

    return { success: true, data: result };
  } catch (error) {
    console.error("Error enhancing prompt:", error);
    return { success: false, error: { message: "Failed to enhance prompt" } };
  }
}

/**
 * Get generations by entity ID (for entity detail page)
 */
export async function getGenerationsByEntityAction(
  entityId: string,
  limit: number = 10
): Promise<ActionResponse<Generation[]>> {
  try {
    // Get current user
    const userId = await getCurrentUserId();
    if (!userId) {
      return { success: false, error: { message: "Unauthorized" } };
    }

    // Get generations
    const generations = await generationService.getGenerationsByEntity(
      entityId,
      limit
    );

    // Filter to only user's generations
    const userGenerations = generations.filter((gen) => gen.userId === userId);

    return { success: true, data: userGenerations };
  } catch (error) {
    console.error("Error fetching generations by entity:", error);
    return { success: false, error: { message: "Failed to fetch generations" } };
  }
}

/**
 * Get generation statistics for a world
 */
export async function getWorldGenerationStatsAction(
  worldId: string
): Promise<
  ActionResponse<{
    total: number;
    byStatus: Record<string, number>;
    byTool: Record<string, number>;
    averageConsistency: number | null;
  }>
> {
  try {
    // Get current user
    const userId = await getCurrentUserId();
    if (!userId) {
      return { success: false, error: { message: "Unauthorized" } };
    }

    // Verify world ownership
    const world = await worldService.getWorldById(worldId, userId);
    if (!world) {
      return { success: false, error: { message: "World not found" } };
    }

    // Get statistics
    const stats = await generationService.getWorldGenerationStats(worldId);

    return { success: true, data: stats };
  } catch (error) {
    console.error("Error fetching generation stats:", error);
    return { success: false, error: { message: "Failed to fetch generation statistics" } };
  }
}

/**
 * Manually trigger consistency check for a generation
 * This is useful when consistency wasn't automatically checked or needs to be re-checked
 */
export async function triggerConsistencyCheckAction(
  generationId: string
): Promise<
  ActionResponse<{
    overallScore: number;
    recommendation: "accept" | "review" | "regenerate";
    message: string;
  }>
> {
  try {
    // Get current user
    const userId = await getCurrentUserId();
    if (!userId) {
      return { success: false, error: { message: "Unauthorized" } };
    }

    // Get generation to verify ownership
    const generation = await generationService.getGenerationById(generationId);
    if (!generation) {
      return { success: false, error: { message: "Generation not found" } };
    }

    // Verify ownership
    if (generation.userId !== userId) {
      return { success: false, error: { message: "Unauthorized" } };
    }

    // Check if generation has a result URL
    if (!generation.resultUrl) {
      return {
        success: false,
        error: { message: "Generation has no result URL to analyze" },
      };
    }

    // Check if generation has entities
    if (!generation.entityIds || generation.entityIds.length === 0) {
      return {
        success: false,
        error: { message: "Generation has no associated entities" },
      };
    }

    // Perform consistency analysis
    const analysis = await consistencyService.analyzeConsistency(
      generationId,
      generation.resultUrl,
      "image"
    );

    // Update generation with consistency score
    await consistencyService.updateGenerationConsistency(
      generationId,
      analysis.overallScore
    );

    // Revalidate relevant paths
    revalidatePath(`/worlds/${generation.worldId}/history`);
    revalidatePath(`/worlds/${generation.worldId}/generate`);

    return {
      success: true,
      data: {
        overallScore: analysis.overallScore,
        recommendation: analysis.recommendation,
        message: analysis.message,
      },
    };
  } catch (error) {
    console.error("Error triggering consistency check:", error);
    return {
      success: false,
      error: { message: "Failed to check consistency" },
    };
  }
}
