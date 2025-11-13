import OpenAI from "openai";
import Replicate from "replicate";
import { embeddingCache } from "@/lib/cache/embedding-cache";

/**
 * Retry configuration for API calls
 */
interface RetryConfig {
  maxRetries: number;
  initialDelayMs: number;
  maxDelayMs: number;
  backoffMultiplier: number;
}

/**
 * Default retry configuration with exponential backoff
 */
const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  initialDelayMs: 1000, // 1 second
  maxDelayMs: 10000, // 10 seconds
  backoffMultiplier: 2,
};

/**
 * Embedding Service for OpenAI and Replicate (CLIP)
 * Handles text and visual embedding generation with retry logic and error handling
 */
export class EmbeddingService {
  private openaiClient: OpenAI;
  private replicateClient: Replicate;
  private retryConfig: RetryConfig;

  constructor(retryConfig: Partial<RetryConfig> = {}) {
    // Validate required environment variables
    const openaiApiKey = process.env.OPENAI_API_KEY;
    const replicateApiToken = process.env.REPLICATE_API_TOKEN;

    if (!openaiApiKey) {
      throw new Error(
        "Missing required OpenAI environment variable. Please check OPENAI_API_KEY."
      );
    }

    if (!replicateApiToken) {
      throw new Error(
        "Missing required Replicate environment variable. Please check REPLICATE_API_TOKEN."
      );
    }

    // Initialize OpenAI client
    this.openaiClient = new OpenAI({
      apiKey: openaiApiKey,
    });

    // Initialize Replicate client
    this.replicateClient = new Replicate({
      auth: replicateApiToken,
    });

    // Merge provided config with defaults
    this.retryConfig = {
      ...DEFAULT_RETRY_CONFIG,
      ...retryConfig,
    };
  }

  /**
   * Sleep for a specified duration
   * @param ms - Milliseconds to sleep
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Calculate delay for exponential backoff
   * @param attempt - Current attempt number (0-indexed)
   * @returns Delay in milliseconds
   */
  private calculateBackoffDelay(attempt: number): number {
    const delay =
      this.retryConfig.initialDelayMs *
      Math.pow(this.retryConfig.backoffMultiplier, attempt);
    return Math.min(delay, this.retryConfig.maxDelayMs);
  }

  /**
   * Check if an error is retryable
   * @param error - Error to check
   * @returns True if the error should trigger a retry
   */
  private isRetryableError(error: unknown): boolean {
    const err = error as { status?: number; code?: string };
    
    // Retry on rate limit errors
    if (err?.status === 429) {
      return true;
    }

    // Retry on server errors (5xx)
    if (err?.status && err.status >= 500 && err.status < 600) {
      return true;
    }

    // Retry on network errors
    if (
      err?.code === "ECONNRESET" ||
      err?.code === "ETIMEDOUT" ||
      err?.code === "ENOTFOUND"
    ) {
      return true;
    }

    return false;
  }

  /**
   * Execute a function with retry logic
   * @param fn - Async function to execute
   * @param context - Context string for error messages
   * @returns Result of the function
   */
  private async withRetry<T>(
    fn: () => Promise<T>,
    context: string
  ): Promise<T> {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= this.retryConfig.maxRetries; attempt++) {
      try {
        return await fn();
      } catch (error: unknown) {
        lastError = error as Error;

        // Don't retry if this is the last attempt
        if (attempt === this.retryConfig.maxRetries) {
          break;
        }

        // Check if error is retryable
        if (!this.isRetryableError(error)) {
          throw error;
        }

        // Calculate backoff delay
        const delay = this.calculateBackoffDelay(attempt);

        const errorMessage = error instanceof Error ? error.message : String(error);
        console.warn(
          `${context} failed (attempt ${attempt + 1}/${this.retryConfig.maxRetries + 1}). ` +
            `Retrying in ${delay}ms... Error: ${errorMessage}`
        );

        // Wait before retrying
        await this.sleep(delay);
      }
    }

    // All retries exhausted
    console.error(`${context} failed after ${this.retryConfig.maxRetries + 1} attempts`);
    throw new Error(
      `${context} failed after ${this.retryConfig.maxRetries + 1} attempts: ${lastError?.message || "Unknown error"}`
    );
  }

  /**
   * Generate visual embedding using CLIP model via Replicate
   * @param imageUrl - URL of the image to generate embedding for
   * @returns 512-dimensional embedding vector
   */
  async generateVisualEmbedding(imageUrl: string): Promise<number[]> {
    if (!imageUrl || imageUrl.trim().length === 0) {
      throw new Error("Image URL cannot be empty");
    }

    return this.withRetry(async () => {
      try {
        // Use CLIP model from Replicate
        // Model: andreasjansson/clip-features
        const output = await this.replicateClient.run(
          "andreasjansson/clip-features:75b33f253f7714a281ad3e9b28f63e3232d583716ef6718f2e46641077ea040a",
          {
            input: {
              inputs: imageUrl,
            },
          }
        );

       

        // The output format can vary - handle different cases
        let embedding: number[];

        if (Array.isArray(output)) {
          // If output is an array, check if it's the embedding directly or nested
          if (output.length === 0) {
            throw new Error("Empty embedding array returned from Replicate CLIP API");
          }
          
          // Check if first element is a number (direct embedding)
          if (typeof output[0] === "number") {
            embedding = output as number[];
          } 
          // Check if first element is an array (nested array)
          else if (Array.isArray(output[0])) {
            embedding = output[0] as number[];
          } 
          // Check if first element is an object with embedding property
          else if (typeof output[0] === "object" && output[0] !== null) {
            const firstItem = output[0] as Record<string, unknown>;
            if (Array.isArray(firstItem.embedding)) {
              embedding = firstItem.embedding as number[];
            } else if (Array.isArray(firstItem.embeddings)) {
              embedding = (firstItem.embeddings as number[][])[0];
            } else if (Array.isArray(firstItem.features)) {
              embedding = firstItem.features as number[];
            } else {
              throw new Error(`Invalid embedding format: object keys are ${Object.keys(firstItem).join(", ")}`);
            }
          } 
          else {
            throw new Error(`Invalid embedding format: first element is ${typeof output[0]}`);
          }
        } else if (output && typeof output === "object") {
          // If output is an object, try to extract embedding from common keys
          const obj = output as Record<string, unknown>;
          if (Array.isArray(obj.embedding)) {
            embedding = obj.embedding as number[];
          } else if (Array.isArray(obj.embeddings)) {
            embedding = (obj.embeddings as number[][])[0];
          } else if (Array.isArray(obj.features)) {
            embedding = obj.features as number[];
          } else {
            throw new Error(`Invalid embedding format: object keys are ${Object.keys(obj).join(", ")}`);
          }
        } else {
          throw new Error(`Invalid embedding format: output type is ${typeof output}`);
        }

        // Validate embedding is an array of numbers
        if (!Array.isArray(embedding) || embedding.length === 0) {
          throw new Error("Embedding is not a valid array");
        }

        if (typeof embedding[0] !== "number") {
          throw new Error(`Embedding contains non-numeric values: ${typeof embedding[0]}`);
        }

        console.log(`Successfully extracted embedding with ${embedding.length} dimensions`);
        return embedding;
      } catch (error: unknown) {
        console.error("Error generating visual embedding:", error);
        throw error;
      }
    }, "Visual embedding generation");
  }

  /**
   * Generate visual embeddings for multiple images in batch
   * @param imageUrls - Array of image URLs to generate embeddings for
   * @returns Array of embedding vectors
   */
  async generateVisualEmbeddingsBatch(
    imageUrls: string[]
  ): Promise<number[][]> {
    if (!imageUrls || imageUrls.length === 0) {
      throw new Error("Image URLs array cannot be empty");
    }

    // Filter out empty URLs
    const validUrls = imageUrls.filter((url) => url && url.trim().length > 0);

    if (validUrls.length === 0) {
      throw new Error("No valid image URLs provided");
    }

    // Process images sequentially to avoid rate limits
    // In production, you might want to add batching logic
    const embeddings: number[][] = [];
    
    for (const url of validUrls) {
      try {
        const embedding = await this.generateVisualEmbedding(url);
        embeddings.push(embedding);
      } catch (error) {
        console.error(`Failed to generate embedding for ${url}:`, error);
        throw error;
      }
    }

    return embeddings;
  }

  /**
   * Generate text embedding using OpenAI's text-embedding-ada-002 model
   * Uses in-memory cache to avoid redundant API calls
   * @param text - Text to generate embedding for
   * @returns 1536-dimensional embedding vector
   */
  async generateTextEmbedding(text: string): Promise<number[]> {
    if (!text || text.trim().length === 0) {
      throw new Error("Text cannot be empty");
    }

    // Create cache key from text hash
    const cacheKey = `text:${this.hashString(text)}`;

    // Check cache first
    const cached = embeddingCache.get(cacheKey);
    if (cached) {
      console.log("Text embedding cache hit");
      return cached;
    }

    return this.withRetry(async () => {
      try {
        const response = await this.openaiClient.embeddings.create({
          model: "text-embedding-ada-002",
          input: text,
        });

        if (!response.data || response.data.length === 0) {
          throw new Error("No embedding returned from OpenAI API");
        }

        const embedding = response.data[0].embedding;

        // Cache the result
        embeddingCache.set(cacheKey, embedding);

        return embedding;
      } catch (error: unknown) {
        // Handle rate limit errors specifically
        const err = error as { status?: number; headers?: Record<string, string> };
        if (err?.status === 429) {
          const retryAfter = err?.headers?.["retry-after"];
          if (retryAfter) {
            console.warn(
              `Rate limited by OpenAI. Retry after ${retryAfter} seconds`
            );
          }
        }

        throw error;
      }
    }, "Text embedding generation");
  }

  /**
   * Simple string hash function for cache keys
   * @param str - String to hash
   * @returns Hash string
   */
  private hashString(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return hash.toString(36);
  }

  /**
   * Generate embeddings for multiple texts in batch
   * @param texts - Array of texts to generate embeddings for
   * @returns Array of embedding vectors
   */
  async generateTextEmbeddingsBatch(
    texts: string[]
  ): Promise<number[][]> {
    if (!texts || texts.length === 0) {
      throw new Error("Texts array cannot be empty");
    }

    // Filter out empty texts
    const validTexts = texts.filter((text) => text && text.trim().length > 0);

    if (validTexts.length === 0) {
      throw new Error("No valid texts provided");
    }

    return this.withRetry(async () => {
      try {
        const response = await this.openaiClient.embeddings.create({
          model: "text-embedding-ada-002",
          input: validTexts,
        });

        if (!response.data || response.data.length === 0) {
          throw new Error("No embeddings returned from OpenAI API");
        }

        // Sort by index to maintain order
        return response.data
          .sort((a, b) => a.index - b.index)
          .map((item) => item.embedding);
      } catch (error: unknown) {
        // Handle rate limit errors specifically
        const err = error as { status?: number; headers?: Record<string, string> };
        if (err?.status === 429) {
          const retryAfter = err?.headers?.["retry-after"];
          if (retryAfter) {
            console.warn(
              `Rate limited by OpenAI. Retry after ${retryAfter} seconds`
            );
          }
        }

        throw error;
      }
    }, "Batch text embedding generation");
  }

  /**
   * Calculate cosine similarity between two vectors
   * @param vectorA - First vector
   * @param vectorB - Second vector
   * @returns Similarity score between -1 and 1
   */
  calculateCosineSimilarity(vectorA: number[], vectorB: number[]): number {
    if (vectorA.length !== vectorB.length) {
      throw new Error("Vectors must have the same length");
    }

    let dotProduct = 0;
    let magnitudeA = 0;
    let magnitudeB = 0;

    for (let i = 0; i < vectorA.length; i++) {
      dotProduct += vectorA[i] * vectorB[i];
      magnitudeA += vectorA[i] * vectorA[i];
      magnitudeB += vectorB[i] * vectorB[i];
    }

    magnitudeA = Math.sqrt(magnitudeA);
    magnitudeB = Math.sqrt(magnitudeB);

    if (magnitudeA === 0 || magnitudeB === 0) {
      return 0;
    }

    return dotProduct / (magnitudeA * magnitudeB);
  }

  /**
   * Normalize a vector to unit length
   * @param vector - Vector to normalize
   * @returns Normalized vector
   */
  normalizeVector(vector: number[]): number[] {
    const magnitude = Math.sqrt(
      vector.reduce((sum, val) => sum + val * val, 0)
    );

    if (magnitude === 0) {
      return vector;
    }

    return vector.map((val) => val / magnitude);
  }

  /**
   * Resize an embedding to a target dimension
   * Uses truncation if source is larger, padding with zeros if smaller
   * @param embedding - Source embedding vector
   * @param targetDim - Target dimension
   * @returns Resized embedding vector
   */
  resizeEmbedding(embedding: number[], targetDim: number): number[] {
    if (embedding.length === targetDim) {
      return embedding;
    }

    if (embedding.length > targetDim) {
      // Truncate to target dimension
      return embedding.slice(0, targetDim);
    }

    // Pad with zeros to reach target dimension
    return [...embedding, ...Array(targetDim - embedding.length).fill(0)];
  }

  /**
   * Combine visual and semantic embeddings with weighted averaging
   * @param visualEmbedding - 512-dimensional visual embedding from CLIP (optional)
   * @param semanticEmbedding - 1536-dimensional semantic embedding from OpenAI (optional)
   * @param visualWeight - Weight for visual embedding (default: 0.6)
   * @param semanticWeight - Weight for semantic embedding (default: 0.4)
   * @returns Combined and normalized embedding vector
   */
  combineEmbeddings(
    visualEmbedding: number[] | null,
    semanticEmbedding: number[] | null,
    visualWeight: number = 0.6,
    semanticWeight: number = 0.4
  ): number[] {
    // Validate that at least one embedding is provided
    if (!visualEmbedding && !semanticEmbedding) {
      throw new Error("At least one embedding (visual or semantic) must be provided");
    }

    // Validate weights sum to 1
    if (Math.abs(visualWeight + semanticWeight - 1.0) > 0.001) {
      throw new Error("Visual and semantic weights must sum to 1.0");
    }

    // Case 1: Only visual embedding provided
    if (visualEmbedding && !semanticEmbedding) {
      return this.normalizeVector(visualEmbedding);
    }

    // Case 2: Only semantic embedding provided
    if (!visualEmbedding && semanticEmbedding) {
      return this.normalizeVector(semanticEmbedding);
    }

    // Case 3: Both embeddings provided - combine them
    if (visualEmbedding && semanticEmbedding) {
      // Normalize both embeddings first
      const normalizedVisual = this.normalizeVector(visualEmbedding);
      const normalizedSemantic = this.normalizeVector(semanticEmbedding);

      // Target dimension for Pinecone (must match index configuration)
      const TARGET_DIM = 1024;

      // Strategy: Reduce or pad each embedding to TARGET_DIM/2, then concatenate
      // This ensures the final combined embedding is exactly TARGET_DIM
      const halfDim = Math.floor(TARGET_DIM / 2);

      // Reduce or pad visual embedding to halfDim
      const resizedVisual = this.resizeEmbedding(normalizedVisual, halfDim);
      
      // Reduce or pad semantic embedding to halfDim
      const resizedSemantic = this.resizeEmbedding(normalizedSemantic, halfDim);

      // Concatenate the two halves
      const combined = [...resizedVisual, ...resizedSemantic];

      // Apply weights by scaling each half
      const weightedCombined = [
        ...combined.slice(0, halfDim).map(v => v * visualWeight),
        ...combined.slice(halfDim).map(v => v * semanticWeight)
      ];

      // Normalize the combined vector
      return this.normalizeVector(weightedCombined);
    }

    // This should never be reached due to earlier validation
    throw new Error("Unexpected state in combineEmbeddings");
  }

  /**
   * Generate combined embedding for an entity
   * Combines visual embeddings from images and semantic embedding from description
   * @param imageUrls - Array of image URLs (optional)
   * @param description - Text description (optional)
   * @param visualWeight - Weight for visual embedding (default: 0.6)
   * @param semanticWeight - Weight for semantic embedding (default: 0.4)
   * @returns Combined embedding vector
   */
  async generateCombinedEmbedding(
    imageUrls: string[] | null,
    description: string | null,
    visualWeight: number = 0.6,
    semanticWeight: number = 0.4
  ): Promise<number[]> {
    let visualEmbedding: number[] | null = null;
    let semanticEmbedding: number[] | null = null;

    // Generate visual embedding if images provided
    if (imageUrls && imageUrls.length > 0) {
      const visualEmbeddings = await this.generateVisualEmbeddingsBatch(imageUrls);
      
      // Average multiple visual embeddings if multiple images
      if (visualEmbeddings.length === 1) {
        visualEmbedding = visualEmbeddings[0];
      } else {
        // Average the embeddings
        const dim = visualEmbeddings[0].length;
        visualEmbedding = Array(dim).fill(0);
        
        for (const embedding of visualEmbeddings) {
          for (let i = 0; i < dim; i++) {
            visualEmbedding[i] += embedding[i];
          }
        }
        
        // Divide by count to get average
        visualEmbedding = visualEmbedding.map(val => val / visualEmbeddings.length);
      }
    }

    // Generate semantic embedding if description provided
    if (description && description.trim().length > 0) {
      semanticEmbedding = await this.generateTextEmbedding(description);
    }

    // Combine embeddings
    return this.combineEmbeddings(
      visualEmbedding,
      semanticEmbedding,
      visualWeight,
      semanticWeight
    );
  }
}

// Export singleton instance
export const embeddingService = new EmbeddingService();
