import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

/**
 * Storage Service for Cloudflare R2 (S3-compatible)
 * Handles image uploads, deletions, and signed URL generation
 */
export class StorageService {
  private client: S3Client;
  private bucketName: string;
  private publicUrl: string;

  constructor() {
    // Validate required environment variables
    const accountId = process.env.R2_ACCOUNT_ID;
    const accessKeyId = process.env.R2_ACCESS_KEY_ID;
    const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
    const bucketName = process.env.R2_BUCKET_NAME;
    const publicUrl = process.env.R2_PUBLIC_URL;

    if (!accountId || !accessKeyId || !secretAccessKey || !bucketName) {
      throw new Error(
        "Missing required R2 environment variables. Please check R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, and R2_BUCKET_NAME."
      );
    }

    this.bucketName = bucketName;
    this.publicUrl = publicUrl || "";

    // Initialize S3 client for Cloudflare R2
    this.client = new S3Client({
      region: "auto",
      endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    });
  }

  /**
   * Upload an image to R2 storage
   * @param file - File buffer to upload
   * @param path - Storage path (e.g., "users/123/worlds/456/entities/789/image.jpg")
   * @param contentType - MIME type of the file
   * @returns Object containing the public URL and storage key
   */
  async uploadImage(
    file: Buffer,
    path: string,
    contentType: string
  ): Promise<{ url: string; key: string }> {
    try {
      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: path,
        Body: file,
        ContentType: contentType,
      });

      await this.client.send(command);

      // Construct public URL
      const url = this.publicUrl
        ? `${this.publicUrl}/${path}`
        : `https://${this.bucketName}.r2.cloudflarestorage.com/${path}`;

      return {
        url,
        key: path,
      };
    } catch (error) {
      console.error("Error uploading image to R2:", error);
      throw new Error(
        `Failed to upload image: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  /**
   * Delete an image from R2 storage
   * @param key - Storage key of the file to delete
   */
  async deleteImage(key: string): Promise<void> {
    try {
      const command = new DeleteObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });

      await this.client.send(command);
    } catch (error) {
      console.error("Error deleting image from R2:", error);
      throw new Error(
        `Failed to delete image: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  /**
   * Generate a signed URL for temporary access to a private object
   * @param key - Storage key of the file
   * @param expiresIn - Expiration time in seconds (default: 3600 = 1 hour)
   * @returns Signed URL string
   */
  async getSignedUrl(key: string, expiresIn: number = 3600): Promise<string> {
    try {
      const command = new GetObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });

      const signedUrl = await getSignedUrl(this.client, command, {
        expiresIn,
      });

      return signedUrl;
    } catch (error) {
      console.error("Error generating signed URL:", error);
      throw new Error(
        `Failed to generate signed URL: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  /**
   * Get metadata about an image in storage
   * @param key - Storage key of the file
   * @returns Object containing file metadata
   */
  async getImageMetadata(key: string): Promise<{
    contentType: string;
    contentLength: number;
    lastModified: Date;
  }> {
    try {
      const command = new HeadObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });

      const response = await this.client.send(command);

      return {
        contentType: response.ContentType || "application/octet-stream",
        contentLength: response.ContentLength || 0,
        lastModified: response.LastModified || new Date(),
      };
    } catch (error) {
      console.error("Error getting image metadata:", error);
      throw new Error(
        `Failed to get image metadata: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }
}

// Export singleton instance
export const storageService = new StorageService();
