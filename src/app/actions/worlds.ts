"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { worldService } from "@/lib/worlds/world-service";
import { getCurrentUserId } from "@/lib/auth/session";
import type { World, WorldStats } from "@/types";

// ============================================================================
// Validation Schemas
// ============================================================================

const createWorldSchema = z.object({
  name: z.string().min(1, "Name is required").max(255, "Name is too long"),
  description: z.string().max(5000, "Description is too long").optional(),
  tags: z.array(z.string()).optional(),
});

const updateWorldSchema = z.object({
  name: z.string().min(1, "Name is required").max(255, "Name is too long").optional(),
  description: z.string().max(5000, "Description is too long").optional(),
  tags: z.array(z.string()).optional(),
  isArchived: z.boolean().optional(),
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
 * Create a new world
 */
export async function createWorldAction(
  formData: FormData
): Promise<ActionResponse<World>> {
  try {
    // Get current user
    const userId = await getCurrentUserId();
    if (!userId) {
      return { success: false, error: "Unauthorized" };
    }

    // Parse and validate form data
    const rawData = {
      name: formData.get("name"),
      description: formData.get("description") || undefined,
      tags: formData.get("tags")
        ? String(formData.get("tags")).split(",").map((t) => t.trim()).filter(Boolean)
        : undefined,
    };

    const validatedData = createWorldSchema.parse(rawData);

    // Create world
    const world = await worldService.createWorld(userId, validatedData);

    // Revalidate worlds list
    revalidatePath("/worlds");

    return { success: true, data: world };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.issues[0].message };
    }
    console.error("Error creating world:", error);
    return { success: false, error: "Failed to create world" };
  }
}

/**
 * Get all worlds for the current user
 */
export async function getWorldsAction(
  includeArchived: boolean = false
): Promise<ActionResponse<World[]>> {
  try {
    // Get current user
    const userId = await getCurrentUserId();
    if (!userId) {
      return { success: false, error: "Unauthorized" };
    }

    // Get worlds
    const worlds = await worldService.getWorlds(userId, includeArchived);

    return { success: true, data: worlds };
  } catch (error) {
    console.error("Error fetching worlds:", error);
    return { success: false, error: "Failed to fetch worlds" };
  }
}

/**
 * Get a world by ID with ownership check
 */
export async function getWorldByIdAction(
  worldId: string
): Promise<ActionResponse<World>> {
  try {
    // Get current user
    const userId = await getCurrentUserId();
    if (!userId) {
      return { success: false, error: "Unauthorized" };
    }

    // Get world
    const world = await worldService.getWorldById(worldId, userId);

    if (!world) {
      return { success: false, error: "World not found" };
    }

    return { success: true, data: world };
  } catch (error) {
    console.error("Error fetching world:", error);
    return { success: false, error: "Failed to fetch world" };
  }
}

/**
 * Update a world
 */
export async function updateWorldAction(
  worldId: string,
  formData: FormData
): Promise<ActionResponse<World>> {
  try {
    // Get current user
    const userId = await getCurrentUserId();
    if (!userId) {
      return { success: false, error: "Unauthorized" };
    }

    // Parse and validate form data
    const rawData: Record<string, unknown> = {};
    
    if (formData.has("name")) {
      rawData.name = formData.get("name");
    }
    if (formData.has("description")) {
      rawData.description = formData.get("description") || undefined;
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

    const validatedData = updateWorldSchema.parse(rawData);

    // Update world
    const world = await worldService.updateWorld(worldId, userId, validatedData);

    if (!world) {
      return { success: false, error: "World not found" };
    }

    // Revalidate relevant paths
    revalidatePath("/worlds");
    revalidatePath(`/worlds/${worldId}`);

    return { success: true, data: world };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.issues[0].message };
    }
    console.error("Error updating world:", error);
    return { success: false, error: "Failed to update world" };
  }
}

/**
 * Delete a world with cascade delete
 */
export async function deleteWorldAction(
  worldId: string
): Promise<ActionResponse<{ message: string }>> {
  try {
    // Get current user
    const userId = await getCurrentUserId();
    if (!userId) {
      return { success: false, error: "Unauthorized" };
    }

    // Delete world
    const deleted = await worldService.deleteWorld(worldId, userId);

    if (!deleted) {
      return { success: false, error: "World not found" };
    }

    // Revalidate worlds list
    revalidatePath("/worlds");

    return { 
      success: true, 
      data: { message: "World deleted successfully" } 
    };
  } catch (error) {
    console.error("Error deleting world:", error);
    return { success: false, error: "Failed to delete world" };
  }
}

/**
 * Get world statistics for dashboard
 */
export async function getWorldStatsAction(
  worldId: string
): Promise<ActionResponse<WorldStats>> {
  try {
    // Get current user
    const userId = await getCurrentUserId();
    if (!userId) {
      return { success: false, error: "Unauthorized" };
    }

    // Get stats
    const stats = await worldService.getWorldStats(worldId, userId);

    if (!stats) {
      return { success: false, error: "World not found" };
    }

    return { success: true, data: stats };
  } catch (error) {
    console.error("Error fetching world stats:", error);
    return { success: false, error: "Failed to fetch world stats" };
  }
}
