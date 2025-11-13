import db from "../../../db/drizzle";
import { entities, entityImages, worlds } from "../../../db/schema";
import { eq, and, inArray } from "drizzle-orm";
import { pdfService } from "./pdf-service";
import { storageService } from "../storage/storage-service";
import type { Entity, EntityImage } from "@/types";

/**
 * ExportService handles World Bible export functionality
 * Generates PDF documents with world entities and uploads to storage
 */
export class ExportService {
  /**
   * Export a World Bible as PDF
   * @param worldId - ID of the world to export
   * @param userId - ID of the user requesting export (for ownership check)
   * @param entityIds - Optional array of specific entity IDs to include (if not provided, exports all)
   * @returns Object containing download URL and expiration time
   */
  async exportWorldBible(
    worldId: string,
    userId: string,
    entityIds?: string[]
  ): Promise<{ downloadUrl: string; expiresAt: Date }> {
    // Verify world ownership
    const [world] = await db
      .select()
      .from(worlds)
      .where(and(eq(worlds.id, worldId), eq(worlds.userId, userId)))
      .limit(1);

    if (!world) {
      throw new Error("World not found or access denied");
    }

    // Fetch entities to export
    const entitiesToExport = await this.fetchEntitiesWithImages(
      worldId,
      entityIds
    );

    if (entitiesToExport.length === 0) {
      throw new Error("No entities found to export");
    }

    // Calculate statistics
    const stats = this.calculateStats(entitiesToExport);

    // Generate PDF
    const pdfBuffer = await pdfService.generateWorldBiblePDF(
      {
        ...world,
        tags: world.tags || [],
      },
      entitiesToExport,
      stats
    );

    // Upload PDF to storage
    const exportId = this.generateExportId();
    const storageKey = `exports/${worldId}/${exportId}.pdf`;
    
    await storageService.uploadImage(pdfBuffer, storageKey, "application/pdf");

    // Generate signed URL with 24-hour expiration
    const expiresIn = 24 * 60 * 60; // 24 hours in seconds
    const downloadUrl = await storageService.getSignedUrl(
      storageKey,
      expiresIn
    );

    const expiresAt = new Date(Date.now() + expiresIn * 1000);

    return {
      downloadUrl,
      expiresAt,
    };
  }

  /**
   * Fetch entities with their images for export
   */
  private async fetchEntitiesWithImages(
    worldId: string,
    entityIds?: string[]
  ): Promise<(Entity & { images: EntityImage[] })[]> {
    // Build query conditions
    const conditions = [
      eq(entities.worldId, worldId),
      eq(entities.isArchived, false),
    ];

    // If specific entity IDs provided, filter by them
    if (entityIds && entityIds.length > 0) {
      conditions.push(inArray(entities.id, entityIds));
    }

    // Fetch entities
    const entitiesResult = await db
      .select()
      .from(entities)
      .where(and(...conditions))
      .orderBy(entities.type, entities.name);

    // Fetch images for each entity
    const entitiesWithImages = await Promise.all(
      entitiesResult.map(async (entity) => {
        const images = await db
          .select()
          .from(entityImages)
          .where(eq(entityImages.entityId, entity.id))
          .orderBy(entityImages.isPrimary, entityImages.uploadedAt);

        return {
          ...entity,
          tags: entity.tags || [],
          metadata: (entity.metadata as Record<string, unknown>) || {},
          images,
        };
      })
    );

    return entitiesWithImages;
  }

  /**
   * Calculate statistics for the export
   */
  private calculateStats(entities: Entity[]): {
    totalEntities: number;
    entityBreakdown: Record<string, number>;
  } {
    const entityBreakdown: Record<string, number> = {
      character: 0,
      location: 0,
      object: 0,
      style: 0,
      custom: 0,
    };

    entities.forEach((entity) => {
      entityBreakdown[entity.type] = (entityBreakdown[entity.type] || 0) + 1;
    });

    return {
      totalEntities: entities.length,
      entityBreakdown,
    };
  }

  /**
   * Generate a unique export ID
   */
  private generateExportId(): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 9);
    return `${timestamp}-${random}`;
  }

  /**
   * Get estimated file size for export (in MB)
   * This is a rough estimate based on entity count and images
   */
  async estimateExportSize(
    worldId: string,
    entityIds?: string[]
  ): Promise<number> {
    const conditions = [
      eq(entities.worldId, worldId),
      eq(entities.isArchived, false),
    ];

    if (entityIds && entityIds.length > 0) {
      conditions.push(inArray(entities.id, entityIds));
    }

    // Count entities
    const entitiesResult = await db
      .select()
      .from(entities)
      .where(and(...conditions));

    // Count images
    const entityIdsList = entitiesResult.map((e) => e.id);
    let totalImageSize = 0;

    if (entityIdsList.length > 0) {
      const images = await db
        .select()
        .from(entityImages)
        .where(inArray(entityImages.entityId, entityIdsList));

      totalImageSize = images.reduce((sum, img) => sum + img.fileSize, 0);
    }

    // Estimate: base PDF size + compressed images (assume 50% compression)
    const basePdfSize = 0.5; // 0.5 MB base
    const estimatedImageSize = (totalImageSize / (1024 * 1024)) * 0.5; // Convert to MB and apply compression
    const estimatedSize = basePdfSize + estimatedImageSize;

    return Math.ceil(estimatedSize * 10) / 10; // Round to 1 decimal place
  }
}

// Export singleton instance
export const exportService = new ExportService();
