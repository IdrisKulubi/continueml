import db from "../../../db/drizzle";
import { branches, entities, entityImages } from "../../../db/schema";
import { eq, and, desc, isNull } from "drizzle-orm";
import { vectorService } from "@/lib/vector/vector-service";
import type { Branch, CreateBranchInput } from "@/types";

/**
 * BranchService handles all business logic for branch management
 * including CRUD operations, entity copying, and branch isolation
 */
export class BranchService {
  /**
   * Create a new branch with entity copying from parent world/branch
   */
  async createBranch(
    worldId: string,
    data: CreateBranchInput
  ): Promise<Branch> {
    // Create the branch
    const [branch] = await db
      .insert(branches)
      .values({
        worldId,
        name: data.name,
        description: data.description || null,
        parentBranchId: data.parentBranchId || null,
      })
      .returning();

    // Copy entities from parent world/branch
    await this.copyEntities(worldId, branch.id, data.parentBranchId || null);

    return branch;
  }

  /**
   * Get all branches for a world
   */
  async getBranches(worldId: string): Promise<Branch[]> {
    const worldBranches = await db
      .select()
      .from(branches)
      .where(eq(branches.worldId, worldId))
      .orderBy(desc(branches.createdAt));

    return worldBranches;
  }

  /**
   * Get a branch by ID
   */
  async getBranchById(branchId: string): Promise<Branch | null> {
    const [branch] = await db
      .select()
      .from(branches)
      .where(eq(branches.id, branchId))
      .limit(1);

    return branch || null;
  }

  /**
   * Delete a branch with cleanup
   * Cascade delete will handle entities and generations
   * Also deletes embeddings from vector database
   */
  async deleteBranch(branchId: string): Promise<boolean> {
    // Delete embeddings from vector database first
    try {
      await vectorService.deleteBranchVectors(branchId);
    } catch (error) {
      console.error("Error deleting branch embeddings:", error);
      // Continue with branch deletion even if embedding deletion fails
    }

    // Delete branch (cascade will handle entities and generations)
    const result = await db
      .delete(branches)
      .where(eq(branches.id, branchId))
      .returning();

    return result.length > 0;
  }

  /**
   * Copy entities from parent world/branch to new branch
   * @param worldId - The world ID
   * @param targetBranchId - The new branch ID to copy entities to
   * @param sourceBranchId - The source branch ID (null = main world)
   */
  async copyEntities(
    worldId: string,
    targetBranchId: string,
    sourceBranchId: string | null
  ): Promise<void> {
    // Get all entities from the source (main world or parent branch)
    const sourceConditions = [eq(entities.worldId, worldId)];
    
    if (sourceBranchId === null) {
      // Copy from main world (entities with null branchId)
      sourceConditions.push(isNull(entities.branchId));
    } else {
      // Copy from parent branch
      sourceConditions.push(eq(entities.branchId, sourceBranchId));
    }

    const sourceEntities = await db
      .select()
      .from(entities)
      .where(and(...sourceConditions));

    // Copy each entity to the new branch
    for (const sourceEntity of sourceEntities) {
      // Create a copy of the entity in the new branch
      const [copiedEntity] = await db
        .insert(entities)
        .values({
          worldId: sourceEntity.worldId,
          branchId: targetBranchId,
          type: sourceEntity.type,
          name: sourceEntity.name,
          description: sourceEntity.description,
          tags: sourceEntity.tags || [],
          metadata: sourceEntity.metadata || {},
          usageCount: 0, // Reset usage count for branch
          isArchived: sourceEntity.isArchived,
        })
        .returning();

      // Copy all images for this entity
      const sourceImages = await db
        .select()
        .from(entityImages)
        .where(eq(entityImages.entityId, sourceEntity.id));

      if (sourceImages.length > 0) {
        await db.insert(entityImages).values(
          sourceImages.map((img) => ({
            entityId: copiedEntity.id,
            url: img.url,
            storageKey: img.storageKey,
            width: img.width,
            height: img.height,
            fileSize: img.fileSize,
            mimeType: img.mimeType,
            isPrimary: img.isPrimary,
          }))
        );
      }
    }
  }

  /**
   * Verify branch belongs to a specific world (for access control)
   */
  async verifyBranchOwnership(
    branchId: string,
    worldId: string
  ): Promise<boolean> {
    const [branch] = await db
      .select({ id: branches.id })
      .from(branches)
      .where(and(eq(branches.id, branchId), eq(branches.worldId, worldId)))
      .limit(1);

    return !!branch;
  }

  /**
   * Get entity count for a branch
   */
  async getBranchEntityCount(branchId: string): Promise<number> {
    const result = await db
      .select()
      .from(entities)
      .where(eq(entities.branchId, branchId));

    return result.length;
  }
}

// Export singleton instance
export const branchService = new BranchService();
