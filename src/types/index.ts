// Core entity types (matching database enum values)
export type EntityType = "character" | "location" | "object" | "style" | "custom";

// Generation tool types (matching database enum values)
export type GenerationTool = "runway" | "midjourney" | "stable_diffusion" | "other";

// Generation status types (matching database enum values)
export type GenerationStatus = "queued" | "processing" | "completed" | "failed";

// User type (extends Better Auth user)
export interface User {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
  emailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// World type
export interface World {
  id: string;
  userId: string;
  name: string;
  description: string | null;
  tags: string[];
  isArchived: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Entity type
export interface Entity {
  id: string;
  worldId: string;
  branchId: string | null;
  type: EntityType;
  name: string;
  description: string;
  tags: string[];
  metadata: Record<string, unknown>;
  usageCount: number;
  isArchived: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Entity image type
export interface EntityImage {
  id: string;
  entityId: string;
  url: string;
  storageKey: string;
  width: number;
  height: number;
  fileSize: number;
  mimeType: string;
  isPrimary: boolean;
  uploadedAt: Date;
}

// Generation type
export interface Generation {
  id: string;
  worldId: string;
  branchId: string | null;
  userId: string;
  originalPrompt: string;
  enhancedPrompt: string;
  entityIds: string[];
  tool: GenerationTool;
  status: GenerationStatus;
  resultUrl: string | null;
  consistencyScore: number | null;
  errorMessage: string | null;
  createdAt: Date;
  completedAt: Date | null;
}

// Branch type
export interface Branch {
  id: string;
  worldId: string;
  name: string;
  description: string | null;
  parentBranchId: string | null;
  createdAt: Date;
}

// Vector record type (Pinecone)
export interface VectorRecord {
  id: string;
  values: number[];
  metadata: {
    entityId: string;
    worldId: string;
    branchId: string | null;
    type: "visual" | "semantic" | "combined";
    imageUrl?: string;
    text?: string;
    createdAt: string;
  };
}

// World statistics type
export interface WorldStats {
  entityCount: number;
  generationCount: number;
  entityBreakdown: Record<EntityType, number>;
  recentEntities: Entity[];
  recentGenerations: Generation[];
  lastActivity: Date | null;
}

// API response types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
}

// Error codes
export enum ErrorCode {
  UNAUTHORIZED = "UNAUTHORIZED",
  FORBIDDEN = "FORBIDDEN",
  NOT_FOUND = "NOT_FOUND",
  VALIDATION_ERROR = "VALIDATION_ERROR",
  EXTERNAL_API_ERROR = "EXTERNAL_API_ERROR",
  STORAGE_ERROR = "STORAGE_ERROR",
  DATABASE_ERROR = "DATABASE_ERROR",
}

// App error type
export interface AppError {
  code: ErrorCode;
  message: string;
  details?: unknown;
  statusCode: number;
}

// Input types for API endpoints
export interface CreateWorldInput {
  name: string;
  description?: string;
  tags?: string[];
}

export interface UpdateWorldInput {
  name?: string;
  description?: string;
  tags?: string[];
  isArchived?: boolean;
}

export interface CreateEntityInput {
  name: string;
  type: EntityType;
  description: string;
  tags?: string[];
  branchId?: string;
}

export interface UpdateEntityInput {
  name?: string;
  description?: string;
  tags?: string[];
  isArchived?: boolean;
}

export interface EntityFilters {
  type?: EntityType;
  tags?: string[];
  search?: string;
  branchId?: string;
  isArchived?: boolean;
}

export interface CreateGenerationInput {
  worldId: string;
  branchId?: string;
  prompt: string;
  entityIds?: string[];
  tool: GenerationTool;
}

export interface GenerationFilters {
  worldId?: string;
  entityId?: string;
  status?: GenerationStatus;
  limit?: number;
  offset?: number;
}

export interface CreateBranchInput {
  name: string;
  description?: string;
  parentBranchId?: string;
}

export interface EmbeddingMetadata {
  entityId: string;
  worldId: string;
  branchId: string | null;
  type: "visual" | "semantic" | "combined";
  imageUrl?: string;
  text?: string;
}

export interface SearchResult {
  entityId: string;
  score: number;
  entity: Entity;
}

export interface ConsistencyAnalysis {
  score: number;
  driftedAttributes: string[];
  visualSimilarity: number;
  semanticSimilarity: number;
  recommendations: string[];
}

export interface ImageMetadata {
  width: number;
  height: number;
  fileSize: number;
  mimeType: string;
}
