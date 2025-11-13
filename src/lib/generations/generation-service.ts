import db from "../../../db/drizzle";
import { generations } from "../../../db/schema";
import { eq, and, desc,  sql } from "drizzle-orm";
import type {
  Generation,
  CreateGenerationInput,
  GenerationFilters,
  Entity,
} from "@/types";
import { entityService } from "../entities/entity-service";

/**
 * GenerationService handles all business logic for generation management
 * including prompt enhancement, CRUD operations, and status tracking
 */
export class GenerationService {
  /**
   * Detect entity names in a prompt (case-insensitive)
   * Returns array of detected entity names
   */
  private detectEntityNames(prompt: string, entities: Entity[]): string[] {
    const detectedNames: string[] = [];

    for (const entity of entities) {
      const lowerName = entity.name.toLowerCase();
      // Use word boundaries to avoid partial matches
      const regex = new RegExp(`\\b${lowerName}\\b`, "i");
      if (regex.test(prompt)) {
        detectedNames.push(entity.name);
      }
    }

    return detectedNames;
  }

  /**
   * Extract top 3 attributes from entity description
   * Attributes are extracted from the first few sentences
   */
  private extractTopAttributes(description: string): string[] {
    // Split by sentences (periods, exclamation marks, question marks)
    const sentences = description
      .split(/[.!?]+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    // Take first 3 sentences as key attributes
    const attributes = sentences.slice(0, 3);

    // If we have fewer than 3 sentences, try to extract comma-separated phrases
    if (attributes.length < 3 && sentences.length > 0) {
      const phrases = sentences[0]
        .split(",")
        .map((p) => p.trim())
        .filter((p) => p.length > 0);
      return phrases.slice(0, 3);
    }

    return attributes;
  }

  /**
   * Enhance prompt with entity attributes
   * Detects entity names and injects their key attributes naturally
   */
  async enhancePrompt(
    prompt: string,
    worldId: string,
    manualEntityIds?: string[]
  ): Promise<{
    originalPrompt: string;
    enhancedPrompt: string;
    detectedEntityIds: string[];
  }> {
    let entitiesToUse: Entity[] = [];

    // If manual entity IDs provided, use those
    if (manualEntityIds && manualEntityIds.length > 0) {
      entitiesToUse = await entityService.getEntitiesByIds(manualEntityIds);
    } else {
      // Otherwise, get all entities from the world to detect names
      const entitiesWithImages = await entityService.getEntities(worldId, {
        isArchived: false,
      });
      entitiesToUse = entitiesWithImages.map((e) => {
        const {  ...entity } = e;
        return entity;
      });
    }

    // Detect entity names in the prompt
    const detectedNames = this.detectEntityNames(prompt, entitiesToUse);

    // Filter entities to only those detected (or all if manual selection)
    const relevantEntities = entitiesToUse.filter((e) =>
      manualEntityIds
        ? manualEntityIds.includes(e.id)
        : detectedNames.includes(e.name)
    );

    if (relevantEntities.length === 0) {
      return {
        originalPrompt: prompt,
        enhancedPrompt: prompt,
        detectedEntityIds: [],
      };
    }

    // Build enhanced prompt by injecting attributes
    let enhancedPrompt = prompt;

    for (const entity of relevantEntities) {
      const attributes = this.extractTopAttributes(entity.description);

      if (attributes.length > 0) {
        // Create attribute string
        const attributeString = attributes.join(", ");

        // Find the entity name in the prompt (case-insensitive)
        const regex = new RegExp(`\\b(${entity.name})\\b`, "gi");

        // Replace with name + attributes in parentheses
        enhancedPrompt = enhancedPrompt.replace(
          regex,
          `$1 (${attributeString})`
        );
      }
    }

    return {
      originalPrompt: prompt,
      enhancedPrompt,
      detectedEntityIds: relevantEntities.map((e) => e.id),
    };
  }

  /**
   * Create a new generation
   */
  async createGeneration(data: CreateGenerationInput): Promise<Generation> {
    // Increment usage count for all entities used
    if (data.entityIds && data.entityIds.length > 0) {
      await Promise.all(
        data.entityIds.map((entityId) =>
          entityService.incrementUsageCount(entityId)
        )
      );
    }

    const [generation] = await db
      .insert(generations)
      .values({
        worldId: data.worldId,
        branchId: data.branchId || null,
        userId: data.userId,
        originalPrompt: data.originalPrompt,
        enhancedPrompt: data.enhancedPrompt,
        entityIds: data.entityIds || [],
        tool: data.tool,
        status: "queued",
        resultUrl: null,
        consistencyScore: null,
        errorMessage: null,
      })
      .returning();

    return {
      ...generation,
      entityIds: generation.entityIds || [],
    };
  }

  /**
   * Get generations with filtering
   */
  async getGenerations(filters: GenerationFilters = {}): Promise<Generation[]> {
    const conditions = [];

    // Filter by world
    if (filters.worldId) {
      conditions.push(eq(generations.worldId, filters.worldId));
    }

    // Filter by user
    if (filters.userId) {
      conditions.push(eq(generations.userId, filters.userId));
    }

    // Filter by status
    if (filters.status) {
      conditions.push(eq(generations.status, filters.status));
    }

    // Filter by tool
    if (filters.tool) {
      conditions.push(eq(generations.tool, filters.tool));
    }

    // Filter by branch
    if (filters.branchId !== undefined) {
      if (filters.branchId === null) {
        conditions.push(sql`${generations.branchId} IS NULL`);
      } else {
        conditions.push(eq(generations.branchId, filters.branchId));
      }
    }

    // Filter by entity (generation must include this entity)
    if (filters.entityId) {
      conditions.push(sql`${filters.entityId} = ANY(${generations.entityIds})`);
    }

    // Apply date range filter
    if (filters.startDate) {
      conditions.push(sql`${generations.createdAt} >= ${filters.startDate}`);
    }
    if (filters.endDate) {
      conditions.push(sql`${generations.createdAt} <= ${filters.endDate}`);
    }

    // Apply pagination
    const limit = filters.limit || 50;
    const offset = filters.offset || 0;

    const results = await db
      .select()
      .from(generations)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(generations.createdAt))
      .limit(limit)
      .offset(offset);

    return results.map((gen) => ({
      ...gen,
      entityIds: gen.entityIds || [],
    }));
  }

  /**
   * Get a generation by ID
   */
  async getGenerationById(generationId: string): Promise<Generation | null> {
    const [generation] = await db
      .select()
      .from(generations)
      .where(eq(generations.id, generationId))
      .limit(1);

    if (!generation) return null;

    return {
      ...generation,
      entityIds: generation.entityIds || [],
    };
  }

  /**
   * Update generation status
   */
  async updateGenerationStatus(
    generationId: string,
    status: "queued" | "processing" | "completed" | "failed",
    resultUrl?: string,
    errorMessage?: string
  ): Promise<Generation | null> {
    const updateData: Partial<typeof generations.$inferInsert> = {
      status,
    };

    if (resultUrl !== undefined) {
      updateData.resultUrl = resultUrl;
    }

    if (errorMessage !== undefined) {
      updateData.errorMessage = errorMessage;
    }

    if (status === "completed" || status === "failed") {
      updateData.completedAt = new Date();
    }

    const [updatedGeneration] = await db
      .update(generations)
      .set(updateData)
      .where(eq(generations.id, generationId))
      .returning();

    if (!updatedGeneration) return null;

    return {
      ...updatedGeneration,
      entityIds: updatedGeneration.entityIds || [],
    };
  }

  /**
   * Update consistency score for a generation
   */
  async updateConsistencyScore(
    generationId: string,
    consistencyScore: number
  ): Promise<Generation | null> {
    const [updatedGeneration] = await db
      .update(generations)
      .set({ consistencyScore })
      .where(eq(generations.id, generationId))
      .returning();

    if (!updatedGeneration) return null;

    return {
      ...updatedGeneration,
      entityIds: updatedGeneration.entityIds || [],
    };
  }

  /**
   * Retry a failed generation
   * Creates a new generation with the same parameters
   */
  async retryGeneration(generationId: string): Promise<Generation | null> {
    const originalGeneration = await this.getGenerationById(generationId);

    if (!originalGeneration) return null;

    // Create a new generation with the same parameters
    const [newGeneration] = await db
      .insert(generations)
      .values({
        worldId: originalGeneration.worldId,
        branchId: originalGeneration.branchId,
        userId: originalGeneration.userId,
        originalPrompt: originalGeneration.originalPrompt,
        enhancedPrompt: originalGeneration.enhancedPrompt,
        entityIds: originalGeneration.entityIds || [],
        tool: originalGeneration.tool,
        status: "queued",
        resultUrl: null,
        consistencyScore: null,
        errorMessage: null,
      })
      .returning();

    return {
      ...newGeneration,
      entityIds: newGeneration.entityIds || [],
    };
  }

  /**
   * Delete a generation
   */
  async deleteGeneration(generationId: string): Promise<void> {
    await db.delete(generations).where(eq(generations.id, generationId));
  }

  /**
   * Get generations by entity ID (for entity detail page)
   */
  async getGenerationsByEntity(
    entityId: string,
    limit: number = 10
  ): Promise<Generation[]> {
    const results = await db
      .select()
      .from(generations)
      .where(sql`${entityId} = ANY(${generations.entityIds})`)
      .orderBy(desc(generations.createdAt))
      .limit(limit);

    return results.map((gen) => ({
      ...gen,
      entityIds: gen.entityIds || [],
    }));
  }

  /**
   * Verify generation belongs to a specific user (for access control)
   */
  async verifyGenerationOwnership(
    generationId: string,
    userId: string
  ): Promise<boolean> {
    const [generation] = await db
      .select({ id: generations.id })
      .from(generations)
      .where(
        and(eq(generations.id, generationId), eq(generations.userId, userId))
      )
      .limit(1);

    return !!generation;
  }

  /**
   * Get generation statistics for a world
   */
  async getWorldGenerationStats(worldId: string): Promise<{
    total: number;
    byStatus: Record<string, number>;
    byTool: Record<string, number>;
    averageConsistency: number | null;
  }> {
    const allGenerations = await db
      .select()
      .from(generations)
      .where(eq(generations.worldId, worldId));

    const total = allGenerations.length;

    // Count by status
    const byStatus: Record<string, number> = {};
    allGenerations.forEach((gen) => {
      byStatus[gen.status] = (byStatus[gen.status] || 0) + 1;
    });

    // Count by tool
    const byTool: Record<string, number> = {};
    allGenerations.forEach((gen) => {
      byTool[gen.tool] = (byTool[gen.tool] || 0) + 1;
    });

    // Calculate average consistency score
    const scoresWithValues = allGenerations
      .filter((gen) => gen.consistencyScore !== null)
      .map((gen) => gen.consistencyScore as number);

    const averageConsistency =
      scoresWithValues.length > 0
        ? scoresWithValues.reduce((sum, score) => sum + score, 0) /
          scoresWithValues.length
        : null;

    return {
      total,
      byStatus,
      byTool,
      averageConsistency,
    };
  }
}

// Export singleton instance
export const generationService = new GenerationService();
