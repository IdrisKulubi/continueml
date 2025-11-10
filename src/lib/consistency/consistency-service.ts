import { embeddingService } from "@/lib/ai/embedding-service";
import { vectorService } from "@/lib/vector/vector-service";
import db from "../../../db/drizzle";
import { entities, generations } from "../../../db/schema";
import { eq, inArray } from "drizzle-orm";

/**
 * Attribute drift information
 */
export interface AttributeDrift {
  attribute: string;
  expectedValue: string;
  detectedIssue: string;
  severity: "low" | "medium" | "high";
}

/**
 * Detailed consistency analysis result
 */
export interface ConsistencyAnalysis {
  overallScore: number; // 0-100
  visualScore: number; // 0-100
  semanticScore: number; // 0-100
  driftedAttributes: AttributeDrift[];
  recommendation: "accept" | "review" | "regenerate";
  message: string;
}

/**
 * Consistency Checking Service
 * Analyzes generated content against entity references to ensure consistency
 */
export class ConsistencyService {
  /**
   * Convert cosine similarity (-1 to 1) to percentage score (0-100)
   * @param similarity - Cosine similarity score
   * @returns Percentage score
   */
  private similarityToPercentage(similarity: number): number {
    // Cosine similarity ranges from -1 to 1
    // Convert to 0-100 scale: (similarity + 1) / 2 * 100
    return Math.round(((similarity + 1) / 2) * 100);
  }

  /**
   * Extract embeddings from generated content
   * @param contentUrl - URL of the generated content (image or video)
   * @param contentType - Type of content ("image" or "video")
   * @returns Embedding vector
   */
  async extractContentEmbedding(
    contentUrl: string,
    contentType: "image" | "video" = "image"
  ): Promise<number[]> {
    try {
      // For images, use CLIP directly
      if (contentType === "image") {
        return await embeddingService.generateVisualEmbedding(contentUrl);
      }

      // For videos, extract a representative frame and generate embedding
      // For MVP, we'll treat video URLs as image URLs (assuming thumbnail or frame)
      // In production, you'd want to extract multiple frames and average embeddings
      return await embeddingService.generateVisualEmbedding(contentUrl);
    } catch (error) {
      console.error("Error extracting content embedding:", error);
      throw new Error(
        `Failed to extract embedding from content: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  /**
   * Get entity embeddings from vector database
   * @param entityIds - Array of entity IDs
   * @returns Map of entity IDs to their combined embeddings
   */
  async getEntityEmbeddings(
    entityIds: string[]
  ): Promise<Map<string, number[]>> {
    try {
      const embeddings = new Map<string, number[]>();

      // Fetch entity embeddings from Pinecone
      // Entity embeddings are stored with ID format: entity_{entityId}_combined
      const vectorIds = entityIds.map((id) => `entity_${id}_combined`);
      const vectors = await vectorService.fetchByIds(vectorIds);

      // Map back to entity IDs
      for (const [vectorId, vectorData] of vectors.entries()) {
        const entityId = vectorId.replace("entity_", "").replace("_combined", "");
        embeddings.set(entityId, vectorData.values);
      }

      return embeddings;
    } catch (error) {
      console.error("Error fetching entity embeddings:", error);
      throw new Error(
        `Failed to fetch entity embeddings: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  /**
   * Compare generated content with source entity embeddings
   * @param contentEmbedding - Embedding of generated content
   * @param entityEmbeddings - Map of entity IDs to their embeddings
   * @returns Map of entity IDs to similarity scores (0-100)
   */
  compareEmbeddings(
    contentEmbedding: number[],
    entityEmbeddings: Map<string, number[]>
  ): Map<string, number> {
    const scores = new Map<string, number>();

    for (const [entityId, entityEmbedding] of entityEmbeddings.entries()) {
      try {
        // Calculate cosine similarity
        const similarity = embeddingService.calculateCosineSimilarity(
          contentEmbedding,
          entityEmbedding
        );

        // Convert to percentage score
        const score = this.similarityToPercentage(similarity);
        scores.set(entityId, score);
      } catch (error) {
        console.error(`Error comparing embeddings for entity ${entityId}:`, error);
        // Set a low score if comparison fails
        scores.set(entityId, 0);
      }
    }

    return scores;
  }

  /**
   * Identify specific attributes that drifted based on entity descriptions
   * @param entityIds - Array of entity IDs
   * @param scores - Map of entity IDs to similarity scores
   * @returns Array of drifted attributes
   */
  async identifyDriftedAttributes(
    entityIds: string[],
    scores: Map<string, number>
  ): Promise<AttributeDrift[]> {
    const drifts: AttributeDrift[] = [];

    try {
      // Fetch entity details from database
      const entityRecords = await db
        .select()
        .from(entities)
        .where(inArray(entities.id, entityIds));

      for (const entity of entityRecords) {
        const score = scores.get(entity.id) || 0;

        // Determine severity based on score
        let severity: "low" | "medium" | "high" = "low";
        if (score < 60) {
          severity = "high";
        } else if (score < 75) {
          severity = "medium";
        }

        // Only report drift if score is below 90%
        if (score < 90) {
          // Extract key attributes from description (first 3 sentences or key phrases)
          const descriptionParts = entity.description
            .split(/[.!?]/)
            .filter((s: string) => s.trim().length > 0)
            .slice(0, 3);

          drifts.push({
            attribute: entity.name,
            expectedValue: descriptionParts.join(". "),
            detectedIssue: `Visual consistency score of ${score}% indicates potential drift from reference`,
            severity,
          });
        }
      }
    } catch (error) {
      console.error("Error identifying drifted attributes:", error);
      // Return empty array if we can't identify specific drifts
    }

    return drifts;
  }

  /**
   * Calculate overall consistency score from individual entity scores
   * @param scores - Map of entity IDs to similarity scores
   * @returns Overall consistency score (0-100)
   */
  calculateOverallScore(scores: Map<string, number>): number {
    if (scores.size === 0) {
      return 0;
    }

    // Calculate average score across all entities
    const totalScore = Array.from(scores.values()).reduce(
      (sum, score) => sum + score,
      0
    );
    return Math.round(totalScore / scores.size);
  }

  /**
   * Generate recommendation based on consistency score
   * @param overallScore - Overall consistency score (0-100)
   * @returns Recommendation and message
   */
  generateRecommendation(overallScore: number): {
    recommendation: "accept" | "review" | "regenerate";
    message: string;
  } {
    if (overallScore >= 90) {
      return {
        recommendation: "accept",
        message:
          "Excellent consistency! The generated content closely matches your entity references.",
      };
    } else if (overallScore >= 75) {
      return {
        recommendation: "review",
        message:
          "Good consistency with minor variations. Review the content to ensure it meets your expectations.",
      };
    } else {
      return {
        recommendation: "regenerate",
        message:
          "Low consistency detected. Consider regenerating with more specific prompts or adjusting entity references.",
      };
    }
  }

  /**
   * Perform complete consistency analysis
   * @param generationId - ID of the generation to analyze
   * @param contentUrl - URL of the generated content
   * @param contentType - Type of content ("image" or "video")
   * @returns Detailed consistency analysis
   */
  async analyzeConsistency(
    generationId: string,
    contentUrl: string,
    contentType: "image" | "video" = "image"
  ): Promise<ConsistencyAnalysis> {
    try {
      // 1. Fetch generation record to get entity IDs
      const [generation] = await db
        .select()
        .from(generations)
        .where(eq(generations.id, generationId))
        .limit(1);

      if (!generation) {
        throw new Error(`Generation ${generationId} not found`);
      }

      if (!generation.entityIds || generation.entityIds.length === 0) {
        throw new Error("Generation has no associated entities");
      }

      // 2. Extract embedding from generated content
      const contentEmbedding = await this.extractContentEmbedding(
        contentUrl,
        contentType
      );

      // 3. Get entity embeddings from vector database
      const entityEmbeddings = await this.getEntityEmbeddings(
        generation.entityIds
      );

      if (entityEmbeddings.size === 0) {
        throw new Error(
          "No embeddings found for entities. Ensure embeddings have been generated."
        );
      }

      // 4. Compare embeddings and calculate scores
      const scores = this.compareEmbeddings(contentEmbedding, entityEmbeddings);

      // 5. Calculate overall score
      const overallScore = this.calculateOverallScore(scores);

      // 6. Identify drifted attributes
      const driftedAttributes = await this.identifyDriftedAttributes(
        generation.entityIds,
        scores
      );

      // 7. Generate recommendation
      const { recommendation, message } = this.generateRecommendation(overallScore);

      // For MVP, we use the same score for visual and semantic
      // In production, you'd want to separate these analyses
      return {
        overallScore,
        visualScore: overallScore,
        semanticScore: overallScore,
        driftedAttributes,
        recommendation,
        message,
      };
    } catch (error) {
      console.error("Error analyzing consistency:", error);
      throw new Error(
        `Failed to analyze consistency: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  /**
   * Update generation record with consistency score
   * @param generationId - ID of the generation
   * @param consistencyScore - Consistency score (0-100)
   */
  async updateGenerationConsistency(
    generationId: string,
    consistencyScore: number
  ): Promise<void> {
    try {
      await db
        .update(generations)
        .set({
          consistencyScore,
        })
        .where(eq(generations.id, generationId));
    } catch (error) {
      console.error("Error updating generation consistency:", error);
      throw new Error(
        `Failed to update generation consistency: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }
}

// Export singleton instance
export const consistencyService = new ConsistencyService();
