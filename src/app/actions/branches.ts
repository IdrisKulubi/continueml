"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { branchService } from "@/lib/branches/branch-service";
import { worldService } from "@/lib/worlds/world-service";
import { getCurrentUserId } from "@/lib/auth/session";
import type { Branch } from "@/types";

// ============================================================================
// Validation Schemas
// ============================================================================

const createBranchSchema = z.object({
  name: z.string().min(1, "Name is required").max(255, "Name is too long"),
  description: z.string().max(5000, "Description is too long").optional(),
  parentBranchId: z.string().uuid().optional(),
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
 * Create a new branch with entity copying
 */
export async function createBranchAction(
  worldId: string,
  formData: FormData
): Promise<ActionResponse<Branch>> {
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
      description: formData.get("description") || undefined,
      parentBranchId: formData.get("parentBranchId") || undefined,
    };

    const validatedData = createBranchSchema.parse(rawData);

    // If parentBranchId is provided, verify it belongs to this world
    if (validatedData.parentBranchId) {
      const isValid = await branchService.verifyBranchOwnership(
        validatedData.parentBranchId,
        worldId
      );
      if (!isValid) {
        return { success: false, error: "Invalid parent branch" };
      }
    }

    // Create branch (this will also copy entities)
    const branch = await branchService.createBranch(worldId, validatedData);

    // Revalidate relevant paths
    revalidatePath(`/worlds/${worldId}`);
    revalidatePath(`/worlds/${worldId}/branches`);
    revalidatePath(`/worlds/${worldId}/entities`);

    return { success: true, data: branch };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.issues[0].message };
    }
    console.error("Error creating branch:", error);
    return { success: false, error: "Failed to create branch" };
  }
}

/**
 * Get all branches for a world
 */
export async function getBranchesAction(
  worldId: string
): Promise<ActionResponse<Branch[]>> {
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

    // Get branches
    const branches = await branchService.getBranches(worldId);

    return { success: true, data: branches };
  } catch (error) {
    console.error("Error fetching branches:", error);
    return { success: false, error: "Failed to fetch branches" };
  }
}

/**
 * Get a branch by ID with ownership check
 */
export async function getBranchByIdAction(
  branchId: string
): Promise<ActionResponse<Branch>> {
  try {
    // Get current user
    const userId = await getCurrentUserId();
    if (!userId) {
      return { success: false, error: "Unauthorized" };
    }

    // Get branch
    const branch = await branchService.getBranchById(branchId);
    if (!branch) {
      return { success: false, error: "Branch not found" };
    }

    // Verify world ownership
    const world = await worldService.getWorldById(branch.worldId, userId);
    if (!world) {
      return { success: false, error: "Unauthorized" };
    }

    return { success: true, data: branch };
  } catch (error) {
    console.error("Error fetching branch:", error);
    return { success: false, error: "Failed to fetch branch" };
  }
}

/**
 * Delete a branch with cleanup
 */
export async function deleteBranchAction(
  branchId: string
): Promise<ActionResponse<{ message: string }>> {
  try {
    // Get current user
    const userId = await getCurrentUserId();
    if (!userId) {
      return { success: false, error: "Unauthorized" };
    }

    // Get branch to verify ownership
    const branch = await branchService.getBranchById(branchId);
    if (!branch) {
      return { success: false, error: "Branch not found" };
    }

    // Verify world ownership
    const world = await worldService.getWorldById(branch.worldId, userId);
    if (!world) {
      return { success: false, error: "Unauthorized" };
    }

    // Delete branch (cascade will handle entities and generations)
    const deleted = await branchService.deleteBranch(branchId);

    if (!deleted) {
      return { success: false, error: "Failed to delete branch" };
    }

    // Revalidate relevant paths
    revalidatePath(`/worlds/${branch.worldId}`);
    revalidatePath(`/worlds/${branch.worldId}/branches`);
    revalidatePath(`/worlds/${branch.worldId}/entities`);

    return { 
      success: true, 
      data: { message: "Branch deleted successfully" } 
    };
  } catch (error) {
    console.error("Error deleting branch:", error);
    return { success: false, error: "Failed to delete branch" };
  }
}

/**
 * Get entity count for a branch
 */
export async function getBranchEntityCountAction(
  branchId: string
): Promise<ActionResponse<{ count: number }>> {
  try {
    // Get current user
    const userId = await getCurrentUserId();
    if (!userId) {
      return { success: false, error: "Unauthorized" };
    }

    // Get branch to verify ownership
    const branch = await branchService.getBranchById(branchId);
    if (!branch) {
      return { success: false, error: "Branch not found" };
    }

    // Verify world ownership
    const world = await worldService.getWorldById(branch.worldId, userId);
    if (!world) {
      return { success: false, error: "Unauthorized" };
    }

    // Get entity count
    const count = await branchService.getBranchEntityCount(branchId);

    return { success: true, data: { count } };
  } catch (error) {
    console.error("Error fetching branch entity count:", error);
    return { success: false, error: "Failed to fetch entity count" };
  }
}
