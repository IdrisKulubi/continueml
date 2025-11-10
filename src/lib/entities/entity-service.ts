import db from "../../../db/drizzle";
import { entities, entityImages } from "../../../db/schema";
import { eq, and, desc, or, ilike, sql, inArray } from "drizzle-orm";
import type {
  Entity,
  EntityImage,
  CreateEntityInput,
  UpdateEntityInput,
  EntityFilters,
} from "@/types";

/**
 * EntityService handles all business logic for entity management
 * including CRUD operations, image management, and filtering
 */
export class EntityService {
  /**
   * Create a new entity in a world
   */
  async createEntity(
    worldId: string,
    data: CreateEntityInput
  ): Promise<Entity> {
    const [entity] = await db
      .insert(entities)
      .values({
        worldId,
        branchId: data.branchId || null,
        type: data.type,
        name: data.name,
        description: data.description,
        tags: data.tags || [],
        metadata: {},
        usageCount: 0,
        isArchived: false,
      })
      .returning();

    return {
      ...entity,
      tags: entity.tags || [],
      metadata: (entity.metadata as Record<string, unknown>) || {},
    };
  }

  /**
   * Get entities with filtering (type, tags, search) including primary images
   */
  async getEntities(
    worldId: string,
    filters: EntityFilters = {}
  ): Promise<(Entity & { primaryImage?: EntityImage })[]> {
    const conditions = [eq(entities.worldId, worldId)];

    // Filter by archived status (default: exclude archived)
    if (filters.isArchived !== undefined) {
      conditions.push(eq(entities.isArchived, filters.isArchived));
    } else {
      conditions.push(eq(entities.isArchived, false));
    }

    // Filter by type
    if (filters.type) {
      conditions.push(eq(entities.type, filters.type));
    }

    // Filter by branch
    if (filters.branchId !== undefined) {
      if (filters.branchId === null) {
        conditions.push(sql`${entities.branchId} IS NULL`);
      } else {
        conditions.push(eq(entities.branchId, filters.branchId));
      }
    }

    // Filter by tags (entity must contain all specified tags)
    if (filters.tags && filters.tags.length > 0) {
      conditions.push(
        sql`${entities.tags} @> ${filters.tags}`
      );
    }

    // Apply search filter (searches name and description)
    if (filters.search) {
      const searchPattern = `%${filters.search}%`;
      const searchCondition = or(
        ilike(entities.name, searchPattern),
        ilike(entities.description, searchPattern)
      );
      if (searchCondition) {
        conditions.push(searchCondition);
      }
    }

    const results = await db
      .select()
      .from(entities)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(entities.updatedAt));

    // Fetch primary images for all entities
    const entitiesWithImages = await Promise.all(
      results.map(async (entity) => {
        const [primaryImage] = await db
          .select()
          .from(entityImages)
          .where(
            and(
              eq(entityImages.entityId, entity.id),
              eq(entityImages.isPrimary, true)
            )
          )
          .limit(1);

        return {
          ...entity,
          tags: entity.tags || [],
          metadata: (entity.metadata as Record<string, unknown>) || {},
          primaryImage: primaryImage || undefined,
        };
      })
    );

    return entitiesWithImages;
  }

  /**
   * Get an entity by ID with its images
   */
  async getEntityById(
    entityId: string
  ): Promise<{ entity: Entity; images: EntityImage[] } | null> {
    const [entity] = await db
      .select()
      .from(entities)
      .where(eq(entities.id, entityId))
      .limit(1);

    if (!entity) return null;

    const images = await db
      .select()
      .from(entityImages)
      .where(eq(entityImages.entityId, entityId))
      .orderBy(desc(entityImages.isPrimary), desc(entityImages.uploadedAt));

    return {
      entity: {
        ...entity,
        tags: entity.tags || [],
        metadata: (entity.metadata as Record<string, unknown>) || {},
      },
      images,
    };
  }

  /**
   * Update an entity
   */
  async updateEntity(
    entityId: string,
    data: UpdateEntityInput
  ): Promise<Entity | null> {
    const updateData: Partial<typeof entities.$inferInsert> = {
      updatedAt: new Date(),
    };

    if (data.name !== undefined) updateData.name = data.name;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.tags !== undefined) updateData.tags = data.tags;
    if (data.isArchived !== undefined) updateData.isArchived = data.isArchived;

    const [updatedEntity] = await db
      .update(entities)
      .set(updateData)
      .where(eq(entities.id, entityId))
      .returning();

    if (!updatedEntity) return null;

    return {
      ...updatedEntity,
      tags: updatedEntity.tags || [],
      metadata: (updatedEntity.metadata as Record<string, unknown>) || {},
    };
  }

  /**
   * Delete an entity with image cleanup
   * Note: Image cleanup should be handled by the caller using StorageService
   * Database cascade will handle entityImages table cleanup
   */
  async deleteEntity(entityId: string): Promise<EntityImage[]> {
    // First, get all images to return their storage keys for cleanup
    const images = await db
      .select()
      .from(entityImages)
      .where(eq(entityImages.entityId, entityId));

    // Delete the entity (cascade will delete entity_images)
    await db.delete(entities).where(eq(entities.id, entityId));

    return images;
  }

  /**
   * Duplicate an entity (creates a copy with " (Copy)" suffix)
   * Also duplicates image references (reuses same URLs, no re-upload)
   */
  async duplicateEntity(entityId: string): Promise<Entity | null> {
    // Get the original entity
    const [originalEntity] = await db
      .select()
      .from(entities)
      .where(eq(entities.id, entityId))
      .limit(1);

    if (!originalEntity) return null;

    // Get all images from the original entity
    const originalImages = await db
      .select()
      .from(entityImages)
      .where(eq(entityImages.entityId, entityId))
      .orderBy(desc(entityImages.isPrimary), desc(entityImages.uploadedAt));

    // Create a new entity with copied attributes
    const [duplicatedEntity] = await db
      .insert(entities)
      .values({
        worldId: originalEntity.worldId,
        branchId: originalEntity.branchId,
        type: originalEntity.type,
        name: `${originalEntity.name} (Copy)`,
        description: originalEntity.description,
        tags: originalEntity.tags || [],
        metadata: originalEntity.metadata || {},
        usageCount: 0,
        isArchived: false,
      })
      .returning();

    // Duplicate image references (reuse same URLs and storage keys)
    if (originalImages.length > 0) {
      await db.insert(entityImages).values(
        originalImages.map((img) => ({
          entityId: duplicatedEntity.id,
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

    return {
      ...duplicatedEntity,
      tags: duplicatedEntity.tags || [],
      metadata: (duplicatedEntity.metadata as Record<string, unknown>) || {},
    };
  }

  /**
   * Increment usage count for an entity
   */
  async incrementUsageCount(entityId: string): Promise<void> {
    await db
      .update(entities)
      .set({
        usageCount: sql`${entities.usageCount} + 1`,
        updatedAt: new Date(),
      })
      .where(eq(entities.id, entityId));
  }

  /**
   * Add an image to an entity
   */
  async addImage(
    entityId: string,
    imageData: {
      url: string;
      storageKey: string;
      width: number;
      height: number;
      fileSize: number;
      mimeType: string;
      isPrimary?: boolean;
    }
  ): Promise<EntityImage> {
    // If this is set as primary, unset other primary images
    if (imageData.isPrimary) {
      await db
        .update(entityImages)
        .set({ isPrimary: false })
        .where(eq(entityImages.entityId, entityId));
    }

    const [image] = await db
      .insert(entityImages)
      .values({
        entityId,
        url: imageData.url,
        storageKey: imageData.storageKey,
        width: imageData.width,
        height: imageData.height,
        fileSize: imageData.fileSize,
        mimeType: imageData.mimeType,
        isPrimary: imageData.isPrimary || false,
      })
      .returning();

    return image;
  }

  /**
   * Remove an image from an entity
   */
  async removeImage(imageId: string): Promise<EntityImage | null> {
    const [image] = await db
      .delete(entityImages)
      .where(eq(entityImages.id, imageId))
      .returning();

    return image || null;
  }

  /**
   * Get all images for an entity
   */
  async getEntityImages(entityId: string): Promise<EntityImage[]> {
    return await db
      .select()
      .from(entityImages)
      .where(eq(entityImages.entityId, entityId))
      .orderBy(desc(entityImages.isPrimary), desc(entityImages.uploadedAt));
  }

  /**
   * Set an image as primary for an entity
   */
  async setPrimaryImage(entityId: string, imageId: string): Promise<void> {
    // Unset all primary images for this entity
    await db
      .update(entityImages)
      .set({ isPrimary: false })
      .where(eq(entityImages.entityId, entityId));

    // Set the specified image as primary
    await db
      .update(entityImages)
      .set({ isPrimary: true })
      .where(eq(entityImages.id, imageId));
  }

  /**
   * Verify entity belongs to a specific world (for access control)
   */
  async verifyEntityOwnership(
    entityId: string,
    worldId: string
  ): Promise<boolean> {
    const [entity] = await db
      .select({ id: entities.id })
      .from(entities)
      .where(and(eq(entities.id, entityId), eq(entities.worldId, worldId)))
      .limit(1);

    return !!entity;
  }

  /**
   * Get entities by IDs (useful for batch operations)
   */
  async getEntitiesByIds(entityIds: string[]): Promise<Entity[]> {
    if (entityIds.length === 0) return [];

    const results = await db
      .select()
      .from(entities)
      .where(inArray(entities.id, entityIds));

    return results.map((entity) => ({
      ...entity,
      tags: entity.tags || [],
      metadata: (entity.metadata as Record<string, unknown>) || {},
    }));
  }

  /**
   * Check if a storage key is used by any entities (for safe deletion)
   */
  async getEntitiesByStorageKey(storageKey: string): Promise<string[]> {
    const results = await db
      .select({ entityId: entityImages.entityId })
      .from(entityImages)
      .where(eq(entityImages.storageKey, storageKey));

    return results.map((r) => r.entityId);
  }
}

// Export singleton instance
export const entityService = new EntityService();
