import OpenAI from "openai";

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
 * Embedding Service for OpenAI
 * Handles text embedding generation with retry logic and error handling
 */
export class EmbeddingService {
  private client: OpenAI;
  private retryConfig: RetryConfig;

  constructor(retryConfig: Partial<RetryConfig> = {}) {
    // Validate required environment variables
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      throw new Error(
        "Missing required OpenAI environment variable. Please check OPENAI_API_KEY."
      );
    }

    // Initialize OpenAI client
    this.client = new OpenAI({
      apiKey,
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
  private isRetryableError(error: any): boolean {
    // Retry on rate limit errors
    if (error?.status === 429) {
      return true;
    }

    // Retry on server errors (5xx)
    if (error?.status >= 500 && error?.status < 600) {
      return true;
    }

    // Retry on network errors
    if (
      error?.code === "ECONNRESET" ||
      error?.code === "ETIMEDOUT" ||
      error?.code === "ENOTFOUND"
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
      } catch (error: any) {
        lastError = error;

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

        console.warn(
          `${context} failed (attempt ${attempt + 1}/${this.retryConfig.maxRetries + 1}). ` +
            `Retrying in ${delay}ms... Error: ${error.message}`
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
   * Generate text embedding using OpenAI's text-embedding-ada-002 model
   * @param text - Text to generate embedding for
   * @returns 1536-dimensional embedding vector
   */
  async generateTextEmbedding(text: string): Promise<number[]> {
    if (!text || text.trim().length === 0) {
      throw new Error("Text cannot be empty");
    }

    return this.withRetry(async () => {
      try {
        const response = await this.client.embeddings.create({
          model: "text-embedding-ada-002",
          input: text,
        });

        if (!response.data || response.data.length === 0) {
          throw new Error("No embedding returned from OpenAI API");
        }

        return response.data[0].embedding;
      } catch (error: any) {
        // Handle rate limit errors specifically
        if (error?.status === 429) {
          const retryAfter = error?.headers?.["retry-after"];
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
        const response = await this.client.embeddings.create({
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
      } catch (error: any) {
        // Handle rate limit errors specifically
        if (error?.status === 429) {
          const retryAfter = error?.headers?.["retry-after"];
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
}

// Export singleton instance
export const embeddingService = new EmbeddingService();
