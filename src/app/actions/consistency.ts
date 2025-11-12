"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { consistencyService, ConsistencyAnalysis } from "@/lib/consistency/consistency-service";
import { getCurrentUserId } from "@/lib/auth/session";
import db from "../../../db/drizzle";
import { generations } from "../../../db/schema";
import { eq } from "drizzle-orm";

/**
 * Input schema for consistency check
 */
const checkConsistencySchema = z.object({
  generationId: z.string().uuid("Invalid generation ID"),
  contentUrl: z.string().url("Invalid content URL"),
  contentType: z.enum(["image", "video"]).default("image"),
});

/**
 * Result type for consistency check action
 */
export type CheckConsistencyResult =
  | {
      success: true;
      data: ConsistencyAnalysis;
    }
  | {
      success: false;
      error: string;
    };

/**
 * Check consistency of generated content against entity references
 * @param input - Generation ID and content URL
 * @returns Consistency analysis result
 */
export async function checkConsistencyAction(
  input: z.infer<typeof checkConsistencySchema>
): Promise<CheckConsistencyResult> {
  try {
    // 1. Validate input
    const validatedInput = checkConsistencySchema.parse(input);

    // 2. Check authentication
    const userId = await getCurrentUserId();
    if (!userId) {
      return {
        success: false,
        error: "Unauthorized. Please log in to check consistency.",
      };
    }

    // 3. Verify generation exists and user owns it
    const [generation] = await db
      .select()
      .from(generations)
      .where(eq(generations.id, validatedInput.generationId))
      .limit(1);

    if (!generation) {
      return {
        success: false,
        error: "Generation not found.",
      };
    }

    if (generation.userId !== userId) {
      return {
        success: false,
        error: "You do not have permission to check this generation.",
      };
    }

    // 4. Perform consistency analysis
    const analysis = await consistencyService.analyzeConsistency(
      validatedInput.generationId,
      validatedInput.contentUrl,
      validatedInput.contentType
    );

    // 5. Update generation record with consistency score
    await consistencyService.updateGenerationConsistency(
      validatedInput.generationId,
      analysis.overallScore
    );

    // 6. Revalidate relevant paths
    revalidatePath(`/worlds/${generation.worldId}/history`);
    revalidatePath(`/worlds/${generation.worldId}/generate`);

    return {
      success: true,
      data: analysis,
    };
  } catch (error) {
    console.error("Error in checkConsistencyAction:", error);

    // Handle validation errors
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.issues[0].message,
      };
    }

    // Handle other errors
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to check consistency. Please try again.",
    };
  }
}

/**
 * Input schema for getting consistency analysis
 */
const getConsistencySchema = z.object({
  generationId: z.string().uuid("Invalid generation ID"),
});

/**
 * Result type for get consistency action
 */
export type GetConsistencyResult =
  | {
      success: true;
      data: {
        consistencyScore: number | null;
        status: string;
      };
    }
  | {
      success: false;
      error: string;
    };

/**
 * Get consistency score for a generation
 * @param input - Generation ID
 * @returns Consistency score if available
 */
export async function getConsistencyAction(
  input: z.infer<typeof getConsistencySchema>
): Promise<GetConsistencyResult> {
  try {
    // 1. Validate input
    const validatedInput = getConsistencySchema.parse(input);

    // 2. Check authentication
    const userId = await getCurrentUserId();
    if (!userId) {
      return {
        success: false,
        error: "Unauthorized. Please log in.",
      };
    }

    // 3. Fetch generation
    const [generation] = await db
      .select({
        consistencyScore: generations.consistencyScore,
        status: generations.status,
        userId: generations.userId,
      })
      .from(generations)
      .where(eq(generations.id, validatedInput.generationId))
      .limit(1);

    if (!generation) {
      return {
        success: false,
        error: "Generation not found.",
      };
    }

    if (generation.userId !== userId) {
      return {
        success: false,
        error: "You do not have permission to view this generation.",
      };
    }

    return {
      success: true,
      data: {
        consistencyScore: generation.consistencyScore,
        status: generation.status,
      },
    };
  } catch (error) {
    console.error("Error in getConsistencyAction:", error);

    // Handle validation errors
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.issues[0].message,
      };
    }

    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to get consistency score. Please try again.",
    };
  }
}

/**
 * Input schema for regenerating with stricter constraints
 */
const regenerateWithConstraintsSchema = z.object({
  generationId: z.string().uuid("Invalid generation ID"),
  additionalConstraints: z.string().optional(),
});

/**
 * Result type for regenerate action
 */
export type RegenerateWithConstraintsResult =
  | {
      success: true;
      data: {
        generationId: string;
        enhancedPrompt: string;
      };
    }
  | {
      success: false;
      error: string;
    };

/**
 * Regenerate content with stricter constraints based on consistency analysis
 * @param input - Generation ID and optional additional constraints
 * @returns New generation with enhanced prompt
 */
export async function regenerateWithConstraintsAction(
  input: z.infer<typeof regenerateWithConstraintsSchema>
): Promise<RegenerateWithConstraintsResult> {
  try {
    // 1. Validate input
    const validatedInput = regenerateWithConstraintsSchema.parse(input);

    // 2. Check authentication
    const userId = await getCurrentUserId();
    if (!userId) {
      return {
        success: false,
        error: "Unauthorized. Please log in to regenerate.",
      };
    }

    // 3. Verify generation exists and user owns it
    const [generation] = await db
      .select()
      .from(generations)
      .where(eq(generations.id, validatedInput.generationId))
      .limit(1);

    if (!generation) {
      return {
        success: false,
        error: "Generation not found.",
      };
    }

    if (generation.userId !== userId) {
      return {
        success: false,
        error: "You do not have permission to regenerate this content.",
      };
    }

    // 4. Create enhanced prompt with stricter constraints
    let enhancedPrompt = generation.enhancedPrompt;
    
    // Add stricter constraints to the prompt
    const constraints = [
      "maintain exact visual consistency",
      "follow reference images precisely",
      "preserve all key attributes",
    ];
    
    if (validatedInput.additionalConstraints) {
      constraints.push(validatedInput.additionalConstraints);
    }
    
    enhancedPrompt = `${enhancedPrompt}. IMPORTANT: ${constraints.join(", ")}.`;

    // 5. Create new generation with enhanced prompt
    const [newGeneration] = await db
      .insert(generations)
      .values({
        worldId: generation.worldId,
        branchId: generation.branchId,
        userId: generation.userId,
        originalPrompt: generation.originalPrompt,
        enhancedPrompt,
        entityIds: generation.entityIds,
        tool: generation.tool,
        status: "queued",
      })
      .returning();

    // 6. Revalidate relevant paths
    revalidatePath(`/worlds/${generation.worldId}/history`);
    revalidatePath(`/worlds/${generation.worldId}/generate`);

    return {
      success: true,
      data: {
        generationId: newGeneration.id,
        enhancedPrompt,
      },
    };
  } catch (error) {
    console.error("Error in regenerateWithConstraintsAction:", error);

    // Handle validation errors
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.issues[0].message,
      };
    }

    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to regenerate with constraints. Please try again.",
    };
  }
}

/**
 * Input schema for updating entity memory
 */
const updateEntityMemorySchema = z.object({
  generationId: z.string().uuid("Invalid generation ID"),
  entityId: z.string().uuid("Invalid entity ID"),
  contentUrl: z.string().url("Invalid content URL"),
});

/**
 * Result type for update entity memory action
 */
export type UpdateEntityMemoryResult =
  | {
      success: true;
      data: {
        message: string;
      };
    }
  | {
      success: false;
      error: string;
    };

/**
 * Update entity memory with generated content
 * This adds the generated content as a new reference image for the entity
 * @param input - Generation ID, entity ID, and content URL
 * @returns Success message
 */
export async function updateEntityMemoryAction(
  input: z.infer<typeof updateEntityMemorySchema>
): Promise<UpdateEntityMemoryResult> {
  try {
    // 1. Validate input
    const validatedInput = updateEntityMemorySchema.parse(input);

    // 2. Check authentication
    const userId = await getCurrentUserId();
    if (!userId) {
      return {
        success: false,
        error: "Unauthorized. Please log in to update entity memory.",
      };
    }

    // 3. Verify generation exists and user owns it
    const [generation] = await db
      .select()
      .from(generations)
      .where(eq(generations.id, validatedInput.generationId))
      .limit(1);

    if (!generation) {
      return {
        success: false,
        error: "Generation not found.",
      };
    }

    if (generation.userId !== userId) {
      return {
        success: false,
        error: "You do not have permission to update this entity.",
      };
    }

    // 4. Verify entity exists and is part of the generation
    if (!generation.entityIds || !generation.entityIds.includes(validatedInput.entityId)) {
      return {
        success: false,
        error: "Entity is not associated with this generation.",
      };
    }

    // Note: In a full implementation, you would:
    // - Download the generated content
    // - Upload it to storage as a new entity image
    // - Regenerate embeddings for the entity
    // For MVP, we'll just return success with a message
    
    return {
      success: true,
      data: {
        message: "Entity memory update queued. This feature will be fully implemented in a future update.",
      },
    };
  } catch (error) {
    console.error("Error in updateEntityMemoryAction:", error);

    // Handle validation errors
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.issues[0].message,
      };
    }

    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to update entity memory. Please try again.",
    };
  }
}

/**
 * Input schema for creating variant entity
 */
const createVariantEntitySchema = z.object({
  generationId: z.string().uuid("Invalid generation ID"),
  sourceEntityId: z.string().uuid("Invalid entity ID"),
  contentUrl: z.string().url("Invalid content URL"),
  variantName: z.string().min(1, "Variant name is required").optional(),
});

/**
 * Result type for create variant entity action
 */
export type CreateVariantEntityResult =
  | {
      success: true;
      data: {
        entityId: string;
        message: string;
      };
    }
  | {
      success: false;
      error: string;
    };

/**
 * Create a variant entity based on generated content
 * This creates a new entity using the generated content as reference
 * @param input - Generation ID, source entity ID, content URL, and optional variant name
 * @returns New entity ID and success message
 */
export async function createVariantEntityAction(
  input: z.infer<typeof createVariantEntitySchema>
): Promise<CreateVariantEntityResult> {
  try {
    // 1. Validate input
    const validatedInput = createVariantEntitySchema.parse(input);

    // 2. Check authentication
    const userId = await getCurrentUserId();
    if (!userId) {
      return {
        success: false,
        error: "Unauthorized. Please log in to create variant entity.",
      };
    }

    // 3. Verify generation exists and user owns it
    const [generation] = await db
      .select()
      .from(generations)
      .where(eq(generations.id, validatedInput.generationId))
      .limit(1);

    if (!generation) {
      return {
        success: false,
        error: "Generation not found.",
      };
    }

    if (generation.userId !== userId) {
      return {
        success: false,
        error: "You do not have permission to create variant entity.",
      };
    }

    // 4. Verify source entity exists and is part of the generation
    if (!generation.entityIds || !generation.entityIds.includes(validatedInput.sourceEntityId)) {
      return {
        success: false,
        error: "Source entity is not associated with this generation.",
      };
    }

    // Note: In a full implementation, you would:
    // - Fetch the source entity details
    // - Download the generated content
    // - Create a new entity with variant name
    // - Upload the content as the entity's reference image
    // - Generate embeddings for the new entity
    // For MVP, we'll return a placeholder response
    
    return {
      success: true,
      data: {
        entityId: "placeholder-entity-id",
        message: "Variant entity creation queued. This feature will be fully implemented in a future update.",
      },
    };
  } catch (error) {
    console.error("Error in createVariantEntityAction:", error);

    // Handle validation errors
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.issues[0].message,
      };
    }

    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to create variant entity. Please try again.",
    };
  }
}
