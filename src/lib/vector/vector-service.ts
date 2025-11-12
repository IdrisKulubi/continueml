import { Pinecone, Index } from "@pinecone-database/pinecone";

/**
 * Metadata structure for vector records in Pinecone
 * Note: Optional fields must be explicitly set to empty string if not provided
 * to satisfy Pinecone's RecordMetadata constraint
 */
export interface VectorMetadata {
  [key: string]: string | number | boolean | string[];
  entityId: string;
  worldId: string;
  branchId: string;
  type: "visual" | "semantic" | "combined";
  imageUrl: string;
  text: string;
  createdAt: string;
}

/**
 * Search result from vector similarity query
 */
export interface VectorSearchResult {
  id: string;
  score: number;
  metadata: VectorMetadata;
}

/**
 * Vector Service for Pinecone
 * Handles embedding storage, retrieval, and similarity search
 */
export class VectorService {
  private client: Pinecone;
  private indexName: string;
  private index: Index<VectorMetadata> | null = null;

  constructor() {
    // Validate required environment variables
    const apiKey = process.env.PINECONE_API_KEY;
    const indexName = process.env.PINECONE_INDEX_NAME;

    if (!apiKey || !indexName) {
      throw new Error(
        "Missing required Pinecone environment variables. Please check PINECONE_API_KEY and PINECONE_INDEX_NAME."
      );
    }

    this.indexName = indexName;

    // Initialize Pinecone client
    this.client = new Pinecone({
      apiKey,
    });
  }

  /**
   * Get or initialize the Pinecone index
   * @returns Pinecone index instance
   */
  private async getIndex(): Promise<Index<VectorMetadata>> {
    if (!this.index) {
      this.index = this.client.index<VectorMetadata>(this.indexName);
    }
    return this.index;
  }

  /**
   * Upsert (insert or update) vectors into Pinecone
   * @param vectors - Array of vectors to upsert
   * @returns Promise that resolves when upsert is complete
   */
  async upsert(
    vectors: Array<{
      id: string;
      values: number[];
      metadata: VectorMetadata;
    }>
  ): Promise<void> {
    try {
      const index = await this.getIndex();

      // Pinecone recommends batching upserts in groups of 100
      const batchSize = 100;
      for (let i = 0; i < vectors.length; i += batchSize) {
        const batch = vectors.slice(i, i + batchSize);
        await index.upsert(batch);
      }
    } catch (error) {
      console.error("Error upserting vectors to Pinecone:", error);
      throw new Error(
        `Failed to upsert vectors: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  /**
   * Query vectors by similarity
   * @param queryVector - The query embedding vector
   * @param options - Query options
   * @returns Array of search results with scores and metadata
   */
  async query(
    queryVector: number[],
    options: {
      topK?: number;
      filter?: Record<string, string | number | boolean | string[]>;
      includeMetadata?: boolean;
    } = {}
  ): Promise<VectorSearchResult[]> {
    try {
      const index = await this.getIndex();

      const { topK = 10, filter = {}, includeMetadata = true } = options;

      const queryResponse = await index.query({
        vector: queryVector,
        topK,
        filter,
        includeMetadata,
      });

      // Transform response to our result format
      return (
        queryResponse.matches?.map((match) => ({
          id: match.id,
          score: match.score || 0,
          metadata: match.metadata as VectorMetadata,
        })) || []
      );
    } catch (error) {
      console.error("Error querying vectors from Pinecone:", error);
      throw new Error(
        `Failed to query vectors: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  /**
   * Delete vectors by IDs
   * @param ids - Array of vector IDs to delete
   */
  async deleteByIds(ids: string[]): Promise<void> {
    try {
      const index = await this.getIndex();

      // Pinecone recommends batching deletes
      const batchSize = 1000;
      for (let i = 0; i < ids.length; i += batchSize) {
        const batch = ids.slice(i, i + batchSize);
        await index.deleteMany(batch);
      }
    } catch (error) {
      // Check if it's a 404 error (vectors don't exist)
      // Pinecone errors can have status in different places
      const err = error as { status?: number; cause?: { status?: number } };
      const errorMessage = error instanceof Error ? error.message : String(error);
      
      // Check for 404 in multiple places (Pinecone error structure varies)
      const is404 = 
        err?.status === 404 || 
        err?.cause?.status === 404 ||
        errorMessage.includes("404") ||
        errorMessage.includes("PineconeNotFoundError");
      
      if (is404) {
        // Vectors don't exist, which is fine - nothing to delete
        return;
      }
      
      console.error("Error deleting vectors from Pinecone:", error);
      throw new Error(
        `Failed to delete vectors: ${errorMessage}`
      );
    }
  }

  /**
   * Delete all vectors matching a filter
   * @param filter - Metadata filter for deletion
   */
  async deleteByFilter(
    filter: Record<string, string | number | boolean | string[]>
  ): Promise<void> {
    try {
      const index = await this.getIndex();
      await index.deleteMany(filter);
    } catch (error) {
      // Check if it's a 404 error (vectors don't exist)
      // Pinecone errors can have status in different places
      const err = error as { status?: number; cause?: { status?: number } };
      const errorMessage = error instanceof Error ? error.message : String(error);
      
      // Check for 404 in multiple places (Pinecone error structure varies)
      const is404 = 
        err?.status === 404 || 
        err?.cause?.status === 404 ||
        errorMessage.includes("404") ||
        errorMessage.includes("PineconeNotFoundError");
      
      if (is404) {
        // Vectors don't exist, which is fine - nothing to delete
        return;
      }
      
      console.error("Error deleting vectors by filter from Pinecone:", error);
      throw new Error(
        `Failed to delete vectors by filter: ${errorMessage}`
      );
    }
  }

  /**
   * Delete all vectors for a specific entity
   * @param entityId - Entity ID to delete vectors for
   */
  async deleteEntityVectors(entityId: string): Promise<void> {
    return this.deleteByFilter({ entityId });
  }

  /**
   * Delete all vectors for a specific world
   * @param worldId - World ID to delete vectors for
   */
  async deleteWorldVectors(worldId: string): Promise<void> {
    return this.deleteByFilter({ worldId });
  }

  /**
   * Delete all vectors for a specific branch
   * @param branchId - Branch ID to delete vectors for
   */
  async deleteBranchVectors(branchId: string): Promise<void> {
    return this.deleteByFilter({ branchId });
  }

  /**
   * Fetch vectors by IDs
   * @param ids - Array of vector IDs to fetch
   * @returns Map of vector IDs to their data
   */
  async fetchByIds(ids: string[]): Promise<
    Map<
      string,
      {
        id: string;
        values: number[];
        metadata: VectorMetadata;
      }
    >
  > {
    try {
      const index = await this.getIndex();
      const response = await index.fetch(ids);

      const results = new Map();
      if (response.records) {
        for (const [id, record] of Object.entries(response.records)) {
          results.set(id, {
            id,
            values: record.values,
            metadata: record.metadata as VectorMetadata,
          });
        }
      }

      return results;
    } catch (error) {
      console.error("Error fetching vectors from Pinecone:", error);
      throw new Error(
        `Failed to fetch vectors: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }
}

// Export singleton instance
export const vectorService = new VectorService();
