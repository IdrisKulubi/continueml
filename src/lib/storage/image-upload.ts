import sharp from "sharp";
import { storageService } from "./storage-service";
import type { ImageMetadata } from "@/types";

/**
 * Image upload configuration
 */
const IMAGE_CONFIG = {
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_MIME_TYPES: [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
    "image/gif",
  ],
  MIN_WIDTH: 100,
  MIN_HEIGHT: 100,
  MAX_WIDTH: 4096,
  MAX_HEIGHT: 4096,
  // Compression settings
  COMPRESSION: {
    QUALITY: 85, // JPEG/WebP quality (0-100)
    MAX_DIMENSION: 2048, // Max width/height for compression
    WEBP_QUALITY: 85, // WebP quality
  },
};

/**
 * Validation error types
 */
export class ImageValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ImageValidationError";
  }
}

/**
 * Validate image file
 */
export function validateImageFile(file: File): void {
  // Check file size
  if (file.size > IMAGE_CONFIG.MAX_FILE_SIZE) {
    throw new ImageValidationError(
      `Image file size exceeds maximum allowed size of ${IMAGE_CONFIG.MAX_FILE_SIZE / 1024 / 1024}MB`
    );
  }

  // Check MIME type
  if (!IMAGE_CONFIG.ALLOWED_MIME_TYPES.includes(file.type)) {
    throw new ImageValidationError(
      `Invalid image type. Allowed types: ${IMAGE_CONFIG.ALLOWED_MIME_TYPES.join(", ")}`
    );
  }
}

/**
 * Get image dimensions from file
 */
export async function getImageDimensions(
  file: File
): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve({
        width: img.width,
        height: img.height,
      });
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new ImageValidationError("Failed to load image"));
    };

    img.src = url;
  });
}

/**
 * Validate image dimensions
 */
export function validateImageDimensions(width: number, height: number): void {
  if (width < IMAGE_CONFIG.MIN_WIDTH || height < IMAGE_CONFIG.MIN_HEIGHT) {
    throw new ImageValidationError(
      `Image dimensions too small. Minimum: ${IMAGE_CONFIG.MIN_WIDTH}x${IMAGE_CONFIG.MIN_HEIGHT}px`
    );
  }

  if (width > IMAGE_CONFIG.MAX_WIDTH || height > IMAGE_CONFIG.MAX_HEIGHT) {
    throw new ImageValidationError(
      `Image dimensions too large. Maximum: ${IMAGE_CONFIG.MAX_WIDTH}x${IMAGE_CONFIG.MAX_HEIGHT}px`
    );
  }
}

/**
 * Generate unique storage key for entity image
 */
export function generateImageStorageKey(
  userId: string,
  worldId: string,
  entityId: string,
  filename: string
): string {
  const timestamp = Date.now();
  const randomSuffix = Math.random().toString(36).substring(2, 8);
  const extension = filename.split(".").pop() || "jpg";
  return `users/${userId}/worlds/${worldId}/entities/${entityId}/${timestamp}-${randomSuffix}.${extension}`;
}

/**
 * Compress and optimize image using sharp
 * Reduces file size while maintaining quality
 */
export async function compressImage(
  buffer: Buffer,
  mimeType: string
): Promise<{ buffer: Buffer; width: number; height: number; mimeType: string }> {
  try {
    const image = sharp(buffer);
    const imageMetadata = await image.metadata();

    // Get original dimensions
    const originalWidth = imageMetadata.width || 0;
    const originalHeight = imageMetadata.height || 0;

    // Calculate new dimensions if image is too large
    let width = originalWidth;
    let height = originalHeight;
    const maxDimension = IMAGE_CONFIG.COMPRESSION.MAX_DIMENSION;

    if (width > maxDimension || height > maxDimension) {
      if (width > height) {
        height = Math.round((height * maxDimension) / width);
        width = maxDimension;
      } else {
        width = Math.round((width * maxDimension) / height);
        height = maxDimension;
      }
    }

    // Resize if needed
    let processedImage = image;
    if (width !== originalWidth || height !== originalHeight) {
      processedImage = image.resize(width, height, {
        fit: "inside",
        withoutEnlargement: true,
      });
    }

    // Compress based on format
    let compressedBuffer: Buffer;
    let outputMimeType = mimeType;

    if (mimeType === "image/png") {
      // Convert PNG to WebP for better compression
      compressedBuffer = await processedImage
        .webp({ quality: IMAGE_CONFIG.COMPRESSION.WEBP_QUALITY })
        .toBuffer();
      outputMimeType = "image/webp";
    } else if (mimeType === "image/jpeg" || mimeType === "image/jpg") {
      compressedBuffer = await processedImage
        .jpeg({ quality: IMAGE_CONFIG.COMPRESSION.QUALITY, progressive: true })
        .toBuffer();
    } else if (mimeType === "image/webp") {
      compressedBuffer = await processedImage
        .webp({ quality: IMAGE_CONFIG.COMPRESSION.WEBP_QUALITY })
        .toBuffer();
    } else if (mimeType === "image/gif") {
      // Keep GIFs as-is (animated GIFs need special handling)
      compressedBuffer = buffer;
    } else {
      // Default to JPEG for unknown formats
      compressedBuffer = await processedImage
        .jpeg({ quality: IMAGE_CONFIG.COMPRESSION.QUALITY })
        .toBuffer();
      outputMimeType = "image/jpeg";
    }

    return {
      buffer: compressedBuffer,
      width,
      height,
      mimeType: outputMimeType,
    };
  } catch (error) {
    console.error("Error compressing image:", error);
    // If compression fails, return original
    const imageMetadata = await sharp(buffer).metadata();
    return {
      buffer,
      width: imageMetadata.width || 0,
      height: imageMetadata.height || 0,
      mimeType,
    };
  }
}

/**
 * Upload entity image with validation and compression
 * This is a server-side function that handles the complete upload process
 */
export async function uploadEntityImage(
  file: Buffer,
  metadata: {
    userId: string;
    worldId: string;
    entityId: string;
    filename: string;
    mimeType: string;
    width: number;
    height: number;
  }
): Promise<{ url: string; storageKey: string; metadata: ImageMetadata }> {
  // Validate dimensions
  validateImageDimensions(metadata.width, metadata.height);

  // Compress and optimize image
  const compressed = await compressImage(file, metadata.mimeType);

  // Generate storage key with correct extension
  const extension = compressed.mimeType.split("/")[1];
  const baseFilename = metadata.filename.replace(/\.[^/.]+$/, "");
  const storageKey = generateImageStorageKey(
    metadata.userId,
    metadata.worldId,
    metadata.entityId,
    `${baseFilename}.${extension}`
  );

  // Upload to R2
  const { url, key } = await storageService.uploadImage(
    compressed.buffer,
    storageKey,
    compressed.mimeType
  );

  return {
    url,
    storageKey: key,
    metadata: {
      width: compressed.width,
      height: compressed.height,
      fileSize: compressed.buffer.length,
      mimeType: compressed.mimeType,
    },
  };
}

/**
 * Delete entity image from storage
 */
export async function deleteEntityImage(storageKey: string): Promise<void> {
  await storageService.deleteImage(storageKey);
}

/**
 * Batch delete entity images
 */
export async function deleteEntityImages(
  storageKeys: string[]
): Promise<void> {
  await Promise.all(storageKeys.map((key) => storageService.deleteImage(key)));
}

/**
 * Client-side image validation (for use in browser)
 */
export async function validateImageFileClient(file: File): Promise<{
  valid: boolean;
  error?: string;
  dimensions?: { width: number; height: number };
}> {
  try {
    // Validate file
    validateImageFile(file);

    // Get dimensions
    const dimensions = await getImageDimensions(file);

    // Validate dimensions
    validateImageDimensions(dimensions.width, dimensions.height);

    return {
      valid: true,
      dimensions,
    };
  } catch (error) {
    return {
      valid: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Convert File to Buffer (for server-side processing)
 */
export async function fileToBuffer(file: File): Promise<Buffer> {
  const arrayBuffer = await file.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

/**
 * Get image metadata from buffer (server-side)
 * Note: For full implementation, consider using a library like 'sharp' for server-side image processing
 * For MVP, we'll rely on client-provided dimensions
 */
export function getImageMetadataFromBuffer(
  buffer: Buffer,
  mimeType: string
): ImageMetadata {
  // For MVP, we'll return basic metadata
  // In production, use a library like 'sharp' to extract actual dimensions
  return {
    width: 0, // Will be provided by client
    height: 0, // Will be provided by client
    fileSize: buffer.length,
    mimeType,
  };
}

export { IMAGE_CONFIG };
