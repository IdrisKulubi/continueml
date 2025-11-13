"use server";

import { z } from "zod";
import { exportService } from "@/lib/export";
import { getCurrentUserId } from "@/lib/auth/session";

// ============================================================================
// Validation Schemas
// ============================================================================

const exportWorldBibleSchema = z.object({
  worldId: z.string().uuid("Invalid world ID"),
  entityIds: z.array(z.string().uuid()).optional(),
  format: z.enum(["pdf"]).default("pdf"), // Future: support markdown, etc.
});

// ============================================================================
// Action Response Types
// ============================================================================

type ActionResponse<T> =
  | { success: true; data: T }
  | { success: false; error: string };

type ExportResponse = {
  downloadUrl: string;
  expiresAt: Date;
  estimatedSize?: number;
};

// ============================================================================
// Server Actions
// ============================================================================

/**
 * Export a World Bible as PDF
 * Generates a PDF document with all entities and their images
 */
export async function exportWorldBibleAction(
  data: z.infer<typeof exportWorldBibleSchema>
): Promise<ActionResponse<ExportResponse>> {
  try {
    // Get current user
    const userId = await getCurrentUserId();
    if (!userId) {
      return { success: false, error: "Unauthorized" };
    }

    // Validate input
    const validatedData = exportWorldBibleSchema.parse(data);

    // Generate export
    const result = await exportService.exportWorldBible(
      validatedData.worldId,
      userId,
      validatedData.entityIds
    );

    return {
      success: true,
      data: {
        downloadUrl: result.downloadUrl,
        expiresAt: result.expiresAt,
      },
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.issues[0].message };
    }
    console.error("Error exporting world bible:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to export world bible",
    };
  }
}

/**
 * Get estimated export size
 * Returns estimated file size in MB for the export
 */
export async function getExportSizeEstimateAction(
  data: { worldId: string; entityIds?: string[] }
): Promise<ActionResponse<{ estimatedSizeMB: number }>> {
  try {
    // Get current user
    const userId = await getCurrentUserId();
    if (!userId) {
      return { success: false, error: "Unauthorized" };
    }

    // Validate world ID
    const worldIdSchema = z.string().uuid("Invalid world ID");
    const validatedWorldId = worldIdSchema.parse(data.worldId);

    // Calculate estimate
    const estimatedSize = await exportService.estimateExportSize(
      validatedWorldId,
      data.entityIds
    );

    return {
      success: true,
      data: { estimatedSizeMB: estimatedSize },
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.issues[0].message };
    }
    console.error("Error estimating export size:", error);
    return {
      success: false,
      error: "Failed to estimate export size",
    };
  }
}
