"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { entityService } from "@/lib/entities/entity-service";
import { worldService } from "@/lib/worlds/world-service";
import { getCurrentUserId } from "@/lib/auth/session";
import {
  uploadEntityImage,
  deleteEntityImage,
  deleteEntityImages,
  IMAGE_CONFIG,
} from "@/lib/storage/image-upload";
import type { Entity, EntityImage, EntityFilters } from "@/types";

// ============================================================================
// Validation Schemas
// ============================================================================

const entityTypeEnum = z.enum([
  "character",
  "location",
  "object",
  "style",
  "custom",
]);

const createEntitySchema = z.object({
  name: z.string().min(1, "Name is required").max(255, "Name is too long"),
  type: entityTypeEnum,
  description: z
    .string()
    .min(20, "Description must be at least 20 characters")
    .max(5000, "Description is too long"),
  tags: z.array(z.string()).optional(),
  branchId: z.string().uuid().optional(),
});

const updateEntitySchema = z.object({
  name: z.string().min(1, "Name is required").max(255, "Name is too long").optional(),
  description: z
    .string()
    .min(20, "Description must be at least 20 characters")
    .max(5000, "Description is too long")
    .optional(),
  tags: z.array(z.string()).optional(),
  isArchived: z.boolean().optional(),
});

const entityFiltersSchema = z.object({
  type: entityTypeEnum.optional(),
  tags: z.array(z.string()).optional(),
  search: z.string().optional(),
  branchId: z.string().uuid().optional().nullable(),
  isArchived: z.boolean().optional(),
});

const uploadImageSchema = z.object({
  filename: z.string(),
  mimeType: z.string().refine(
    (type) => IMAGE_CONFIG.ALLOWED_MIME_TYPES.includes(type),
    "Invalid image type"
  ),
  width: z.number().min(IMAGE_CONFIG.MIN_WIDTH).max(IMAGE_CONFIG.MAX_WIDTH),
  height: z.number().min(IMAGE_CONFIG.MIN_HEIGHT).max(IMAGE_CONFIG.MAX_HEIGHT),
  fileSize: z.number().max(IMAGE_CONFIG.MAX_FILE_SIZE),
  isPrimary: z.boolean().optional(),
});

// ============================================================================
// Action Response Types
// ============================================================================

type ActionResponse<T> =
  | { success: true; data: T }
  | { success: false; error: string };

// ============================================================================
// Server Actions
// ============================================================================

/**
 * Create a new entity in a world
 */
export async function createEntityAction(
  worldId: string,
  formData: FormData
): Promise<ActionResponse<Entity>> {
  try {
    // Get current user
    const userId = await getCurrentUserId();
    if (!userId) {
      return { success: false, error: "Unauthorized" };
    }

    // Verify world ownership
    const world = await worldService.getWorldById(worldId, userId);
    if (!world) {
      return { success: false, error: "World not found" };
    }

    // Parse and validate form data
    const rawData = {
      name: formData.get("name"),
      type: formData.get("type"),
      description: formData.get("description"),
      tags: formData.get("tags")
        ? String(formData.get("tags"))
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean)
        : undefined,
      branchId: formData.get("branchId") || undefined,
    };

    const validatedData = createEntitySchema.parse(rawData);

    // Create entity
    const entity = await entityService.createEntity(worldId, validatedData);

    // Revalidate relevant paths
    revalidatePath(`/worlds/${worldId}/entities`);
    revalidatePath(`/worlds/${worldId}`);

    return { success: true, data: entity };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.issues[0].message };
    }
    console.error("Error creating entity:", error);
    return { success: false, error: "Failed to create entity" };
  }
}

/**
 * Get entities with filtering
 */
export async function getEntitiesAction(
  worldId: string,
  filters?: EntityFilters
): Promise<ActionResponse<Entity[]>> {
  try {
    // Get current user
    const userId = await getCurrentUserId();
    if (!userId) {
      return { success: false, error: "Unauthorized" };
    }

    // Verify world ownership
    const world = await worldService.getWorldById(worldId, userId);
    if (!world) {
      return { success: false, error: "World not found" };
    }

    // Validate filters if provided
    const validatedFilters = filters
      ? entityFiltersSchema.parse(filters)
      : {};

    // Get entities
    const entities = await entityService.getEntities(
      worldId,
      validatedFilters
    );

    return { success: true, data: entities };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.issues[0].message };
    }
    console.error("Error fetching entities:", error);
    return { success: false, error: "Failed to fetch entities" };
  }
}

/**
 * Get an entity by ID with images
 */
export async function getEntityByIdAction(
  entityId: string
): Promise<ActionResponse<{ entity: Entity; images: EntityImage[] }>> {
  try {
    // Get current user
    const userId = await getCurrentUserId();
    if (!userId) {
      return { success: false, error: "Unauthorized" };
    }

    // Get entity
    const result = await entityService.getEntityById(entityId);
    if (!result) {
      return { success: false, error: "Entity not found" };
    }

    // Verify world ownership
    const world = await worldService.getWorldById(result.entity.worldId, userId);
    if (!world) {
      return { success: false, error: "Unauthorized" };
    }

    return { success: true, data: result };
  } catch (error) {
    console.error("Error fetching entity:", error);
    return { success: false, error: "Failed to fetch entity" };
  }
}

/**
 * Update an entity
 */
export async function updateEntityAction(
  entityId: string,
  formData: FormData
): Promise<ActionResponse<Entity>> {
  try {
    // Get current user
    const userId = await getCurrentUserId();
    if (!userId) {
      return { success: false, error: "Unauthorized" };
    }

    // Get entity to verify ownership
    const result = await entityService.getEntityById(entityId);
    if (!result) {
      return { success: false, error: "Entity not found" };
    }

    // Verify world ownership
    const world = await worldService.getWorldById(result.entity.worldId, userId);
    if (!world) {
      return { success: false, error: "Unauthorized" };
    }

    // Parse and validate form data
    const rawData: Record<string, unknown> = {};

    if (formData.has("name")) {
      rawData.name = formData.get("name");
    }
    if (formData.has("description")) {
      rawData.description = formData.get("description");
    }
    if (formData.has("tags")) {
      rawData.tags = String(formData.get("tags"))
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);
    }
    if (formData.has("isArchived")) {
      rawData.isArchived = formData.get("isArchived") === "true";
    }

    const validatedData = updateEntitySchema.parse(rawData);

    // Update entity
    const entity = await entityService.updateEntity(entityId, validatedData);

    if (!entity) {
      return { success: false, error: "Entity not found" };
    }

    // Revalidate relevant paths
    revalidatePath(`/worlds/${entity.worldId}/entities`);
    revalidatePath(`/worlds/${entity.worldId}/entities/${entityId}`);
    revalidatePath(`/worlds/${entity.worldId}`);

    return { success: true, data: entity };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.issues[0].message };
    }
    console.error("Error updating entity:", error);
    return { success: false, error: "Failed to update entity" };
  }
}

/**
 * Delete an entity with image cleanup
 */
export async function deleteEntityAction(
  entityId: string
): Promise<ActionResponse<{ message: string }>> {
  try {
    // Get current user
    const userId = await getCurrentUserId();
    if (!userId) {
      return { success: false, error: "Unauthorized" };
    }

    // Get entity to verify ownership and get worldId
    const result = await entityService.getEntityById(entityId);
    if (!result) {
      return { success: false, error: "Entity not found" };
    }

    // Verify world ownership
    const world = await worldService.getWorldById(result.entity.worldId, userId);
    if (!world) {
      return { success: false, error: "Unauthorized" };
    }

    // Delete entity and get images for cleanup
    const images = await entityService.deleteEntity(entityId);

    // Delete images from storage
    if (images.length > 0) {
      const storageKeys = images.map((img) => img.storageKey);
      await deleteEntityImages(storageKeys);
    }

    // Revalidate relevant paths
    revalidatePath(`/worlds/${result.entity.worldId}/entities`);
    revalidatePath(`/worlds/${result.entity.worldId}`);

    return {
      success: true,
      data: { message: "Entity deleted successfully" },
    };
  } catch (error) {
    console.error("Error deleting entity:", error);
    return { success: false, error: "Failed to delete entity" };
  }
}

/**
 * Upload an image for an entity
 */
export async function uploadEntityImageAction(
  entityId: string,
  imageData: {
    buffer: string; // Base64 encoded buffer
    filename: string;
    mimeType: string;
    width: number;
    height: number;
    fileSize: number;
    isPrimary?: boolean;
  }
): Promise<ActionResponse<EntityImage>> {
  try {
    // Get current user
    const userId = await getCurrentUserId();
    if (!userId) {
      return { success: false, error: "Unauthorized" };
    }

    // Get entity to verify ownership
    const result = await entityService.getEntityById(entityId);
    if (!result) {
      return { success: false, error: "Entity not found" };
    }

    // Verify world ownership
    const world = await worldService.getWorldById(result.entity.worldId, userId);
    if (!world) {
      return { success: false, error: "Unauthorized" };
    }

    // Validate image data
    const validatedImageData = uploadImageSchema.parse(imageData);

    // Convert base64 to buffer
    const buffer = Buffer.from(imageData.buffer, "base64");

    // Upload image to storage
    const uploadResult = await uploadEntityImage(buffer, {
      userId,
      worldId: result.entity.worldId,
      entityId,
      filename: validatedImageData.filename,
      mimeType: validatedImageData.mimeType,
      width: validatedImageData.width,
      height: validatedImageData.height,
    });

    // Add image to entity
    const image = await entityService.addImage(entityId, {
      url: uploadResult.url,
      storageKey: uploadResult.storageKey,
      width: uploadResult.metadata.width,
      height: uploadResult.metadata.height,
      fileSize: uploadResult.metadata.fileSize,
      mimeType: uploadResult.metadata.mimeType,
      isPrimary: validatedImageData.isPrimary,
    });

    // Revalidate relevant paths
    revalidatePath(`/worlds/${result.entity.worldId}/entities/${entityId}`);

    return { success: true, data: image };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.issues[0].message };
    }
    console.error("Error uploading entity image:", error);
    return { success: false, error: "Failed to upload image" };
  }
}

/**
 * Delete an image from an entity
 */
export async function deleteEntityImageAction(
  imageId: string
): Promise<ActionResponse<{ message: string }>> {
  try {
    // Get current user
    const userId = await getCurrentUserId();
    if (!userId) {
      return { success: false, error: "Unauthorized" };
    }

    // Get image to verify ownership
    const image = await entityService.removeImage(imageId);
    if (!image) {
      return { success: false, error: "Image not found" };
    }

    // Get entity to verify ownership
    const result = await entityService.getEntityById(image.entityId);
    if (!result) {
      return { success: false, error: "Entity not found" };
    }

    // Verify world ownership
    const world = await worldService.getWorldById(result.entity.worldId, userId);
    if (!world) {
      return { success: false, error: "Unauthorized" };
    }

    // Delete image from storage
    await deleteEntityImage(image.storageKey);

    // Revalidate relevant paths
    revalidatePath(`/worlds/${result.entity.worldId}/entities/${image.entityId}`);

    return {
      success: true,
      data: { message: "Image deleted successfully" },
    };
  } catch (error) {
    console.error("Error deleting entity image:", error);
    return { success: false, error: "Failed to delete image" };
  }
}

/**
 * Duplicate an entity
 */
export async function duplicateEntityAction(
  entityId: string
): Promise<ActionResponse<Entity>> {
  try {
    // Get current user
    const userId = await getCurrentUserId();
    if (!userId) {
      return { success: false, error: "Unauthorized" };
    }

    // Get entity to verify ownership
    const result = await entityService.getEntityById(entityId);
    if (!result) {
      return { success: false, error: "Entity not found" };
    }

    // Verify world ownership
    const world = await worldService.getWorldById(result.entity.worldId, userId);
    if (!world) {
      return { success: false, error: "Unauthorized" };
    }

    // Duplicate entity
    const duplicatedEntity = await entityService.duplicateEntity(entityId);

    if (!duplicatedEntity) {
      return { success: false, error: "Failed to duplicate entity" };
    }

    // Note: Images are NOT duplicated in MVP to avoid storage costs
    // This can be added as a future enhancement

    // Revalidate relevant paths
    revalidatePath(`/worlds/${result.entity.worldId}/entities`);
    revalidatePath(`/worlds/${result.entity.worldId}`);

    return { success: true, data: duplicatedEntity };
  } catch (error) {
    console.error("Error duplicating entity:", error);
    return { success: false, error: "Failed to duplicate entity" };
  }
}

/**
 * Set an image as primary for an entity
 */
export async function setPrimaryImageAction(
  entityId: string,
  imageId: string
): Promise<ActionResponse<{ message: string }>> {
  try {
    // Get current user
    const userId = await getCurrentUserId();
    if (!userId) {
      return { success: false, error: "Unauthorized" };
    }

    // Get entity to verify ownership
    const result = await entityService.getEntityById(entityId);
    if (!result) {
      return { success: false, error: "Entity not found" };
    }

    // Verify world ownership
    const world = await worldService.getWorldById(result.entity.worldId, userId);
    if (!world) {
      return { success: false, error: "Unauthorized" };
    }

    // Set primary image
    await entityService.setPrimaryImage(entityId, imageId);

    // Revalidate relevant paths
    revalidatePath(`/worlds/${result.entity.worldId}/entities/${entityId}`);

    return {
      success: true,
      data: { message: "Primary image updated successfully" },
    };
  } catch (error) {
    console.error("Error setting primary image:", error);
    return { success: false, error: "Failed to set primary image" };
  }
}
