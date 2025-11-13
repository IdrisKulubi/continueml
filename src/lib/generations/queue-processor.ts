import { generationService } from "./generation-service";
import { replicateService } from "./replicate-service";
import type { Generation } from "@/types";

/**
 * QueueProcessor handles background processing of queued generations
 */
export class QueueProcessor {
  private isProcessing = false;

  /**
   * Process all queued generations
   * Returns number of generations processed
   */
  async processQueue(): Promise<number> {
    // Prevent concurrent processing
    if (this.isProcessing) {
      console.log("Queue processor already running");
      return 0;
    }

    this.isProcessing = true;
    let processedCount = 0;

    try {
      // Get all queued generations
      const queuedGenerations = await generationService.getGenerations({
        status: "queued",
        limit: 10, // Process 10 at a time
      });

      console.log(`Found ${queuedGenerations.length} queued generations`);

      // Process each generation
      for (const generation of queuedGenerations) {
        try {
          await this.processGeneration(generation);
          processedCount++;
        } catch (error) {
          console.error(
            `Failed to process generation ${generation.id}:`,
            error
          );
          // Mark as failed
          await generationService.updateGenerationStatus(
            generation.id,
            "failed",
            undefined,
            error instanceof Error ? error.message : "Unknown error"
          );
        }
      }

      return processedCount;
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Process a single generation based on its tool
   */
  private async processGeneration(generation: Generation): Promise<void> {
    console.log(`Processing generation ${generation.id} with ${generation.tool}`);

    // Mark as processing
    await generationService.updateGenerationStatus(
      generation.id,
      "processing"
    );

    let resultUrl: string;

    switch (generation.tool) {
      case "stable_diffusion":
        resultUrl = await replicateService.generateImage(
          generation.enhancedPrompt
        );
        break;

      case "runway":
        // For now, mark as failed with helpful message
        throw new Error(
          "Runway API integration not yet implemented. Please generate manually and update status."
        );

      case "midjourney":
        // For now, mark as failed with helpful message
        throw new Error(
          "Midjourney API integration not yet implemented. Please generate manually and update status."
        );

      case "other":
        // Default to Stable Diffusion
        resultUrl = await replicateService.generateImage(
          generation.enhancedPrompt
        );
        break;

      default:
        throw new Error(`Unknown generation tool: ${generation.tool}`);
    }

    // Mark as completed with result URL
    await generationService.updateGenerationStatus(
      generation.id,
      "completed",
      resultUrl
    );

    console.log(`Generation ${generation.id} completed: ${resultUrl}`);
  }

  /**
   * Check if processor is currently running
   */
  isRunning(): boolean {
    return this.isProcessing;
  }
}

// Export singleton instance
export const queueProcessor = new QueueProcessor();
