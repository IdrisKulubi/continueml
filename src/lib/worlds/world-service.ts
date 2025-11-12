import db from "../../../db/drizzle";
import { worlds, entities, generations, entityImages } from "../../../db/schema";
import { eq, and, desc, sql } from "drizzle-orm";
import type {
  World,
  CreateWorldInput,
  UpdateWorldInput,
  WorldStats,
  EntityType,
} from "@/types";

/**
 * WorldService handles all business logic for world management
 * including CRUD operations, statistics, and access control
 */
export class WorldService {
  /**
   * Create a new world for a user
   */
  async createWorld(
    userId: string,
    data: CreateWorldInput
  ): Promise<World> {
    const [world] = await db
      .insert(worlds)
      .values({
        userId,
        name: data.name,
        description: data.description || null,
        tags: data.tags || [],
        isArchived: false,
      })
      .returning();

    return {
      ...world,
      tags: world.tags || [],
    };
  }

  /**
   * Get all worlds for a user (excluding archived by default)
   */
  async getWorlds(
    userId: string,
    includeArchived: boolean = false
  ): Promise<World[]> {
    const conditions = [eq(worlds.userId, userId)];

    if (!includeArchived) {
      conditions.push(eq(worlds.isArchived, false));
    }

    const userWorlds = await db
      .select()
      .from(worlds)
      .where(and(...conditions))
      .orderBy(desc(worlds.updatedAt));

    return userWorlds.map((world) => ({
      ...world,
      tags: world.tags || [],
    }));
  }

  /**
   * Get a world by ID with ownership check
   */
  async getWorldById(worldId: string, userId: string): Promise<World | null> {
    const [world] = await db
      .select()
      .from(worlds)
      .where(and(eq(worlds.id, worldId), eq(worlds.userId, userId)))
      .limit(1);

    if (!world) return null;

    return {
      ...world,
      tags: world.tags || [],
    };
  }

  /**
   * Update a world with ownership check
   */
  async updateWorld(
    worldId: string,
    userId: string,
    data: UpdateWorldInput
  ): Promise<World | null> {
    // First verify ownership
    const existingWorld = await this.getWorldById(worldId, userId);
    if (!existingWorld) {
      return null;
    }

    const updateData: Partial<typeof worlds.$inferInsert> = {
      updatedAt: new Date(),
    };

    if (data.name !== undefined) updateData.name = data.name;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.tags !== undefined) updateData.tags = data.tags;
    if (data.isArchived !== undefined) updateData.isArchived = data.isArchived;

    const [updatedWorld] = await db
      .update(worlds)
      .set(updateData)
      .where(and(eq(worlds.id, worldId), eq(worlds.userId, userId)))
      .returning();

    if (!updatedWorld) return null;

    return {
      ...updatedWorld,
      tags: updatedWorld.tags || [],
    };
  }

  /**
   * Delete a world with cascade delete (entities and generations)
   * Cascade is handled by database foreign key constraints
   */
  async deleteWorld(worldId: string, userId: string): Promise<boolean> {
    // Verify ownership before deletion
    const existingWorld = await this.getWorldById(worldId, userId);
    if (!existingWorld) {
      return false;
    }

    const result = await db
      .delete(worlds)
      .where(and(eq(worlds.id, worldId), eq(worlds.userId, userId)))
      .returning();

    return result.length > 0;
  }

  /**
   * Get world statistics for dashboard
   */
  async getWorldStats(worldId: string, userId: string): Promise<WorldStats | null> {
    // Verify ownership
    const world = await this.getWorldById(worldId, userId);
    if (!world) {
      return null;
    }

    // Get entity count
    const entityCountResult = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(entities)
      .where(and(eq(entities.worldId, worldId), eq(entities.isArchived, false)));

    const entityCount = entityCountResult[0]?.count || 0;

    // Get generation count
    const generationCountResult = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(generations)
      .where(eq(generations.worldId, worldId));

    const generationCount = generationCountResult[0]?.count || 0;

    // Get entity breakdown by type
    const entityBreakdownResult = await db
      .select({
        type: entities.type,
        count: sql<number>`count(*)::int`,
      })
      .from(entities)
      .where(and(eq(entities.worldId, worldId), eq(entities.isArchived, false)))
      .groupBy(entities.type);

    const entityBreakdown: Record<EntityType, number> = {
      character: 0,
      location: 0,
      object: 0,
      style: 0,
      custom: 0,
    };

    entityBreakdownResult.forEach((row) => {
      entityBreakdown[row.type as EntityType] = row.count;
    });

    // Get recent entities (last 10) with primary images
    const recentEntitiesRaw = await db
      .select()
      .from(entities)
      .where(and(eq(entities.worldId, worldId), eq(entities.isArchived, false)))
      .orderBy(desc(entities.updatedAt))
      .limit(10);

    // Fetch primary images for recent entities
    const recentEntities = await Promise.all(
      recentEntitiesRaw.map(async (entity) => {
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

    // Get recent generations (last 5)
    const recentGenerationsRaw = await db
      .select()
      .from(generations)
      .where(eq(generations.worldId, worldId))
      .orderBy(desc(generations.createdAt))
      .limit(5);

    const recentGenerations = recentGenerationsRaw.map((gen) => ({
      ...gen,
      entityIds: gen.entityIds || [],
    }));

    // Get last activity date (most recent between entity update and generation)
    let lastActivity: Date | null = null;

    if (recentEntities.length > 0 || recentGenerations.length > 0) {
      const dates: Date[] = [];
      if (recentEntities.length > 0) {
        dates.push(recentEntities[0].updatedAt);
      }
      if (recentGenerations.length > 0) {
        dates.push(recentGenerations[0].createdAt);
      }
      lastActivity = new Date(Math.max(...dates.map((d) => d.getTime())));
    }

    return {
      entityCount,
      generationCount,
      entityBreakdown,
      recentEntities,
      recentGenerations,
      lastActivity,
    };
  }
}

// Export singleton instance
export const worldService = new WorldService();
