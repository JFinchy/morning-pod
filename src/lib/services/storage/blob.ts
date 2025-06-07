import { createId } from "@paralleldrive/cuid2";
import { put, del, head } from "@vercel/blob";

export interface BlobUploadOptions {
  filename?: string;
  contentType?: string;
  addRandomSuffix?: boolean;
}

export interface BlobUploadResult {
  success: boolean;
  url?: string;
  pathname?: string;
  size?: number;
  error?: string;
  metadata?: {
    uploadTime: number;
    contentType: string;
    filename: string;
  };
}

export interface BlobDeleteResult {
  success: boolean;
  error?: string;
}

export interface BlobInfoResult {
  success: boolean;
  exists?: boolean;
  size?: number;
  contentType?: string;
  uploadedAt?: Date;
  error?: string;
}

export class BlobStorageService {
  private readonly baseUrl: string;

  constructor() {
    // Vercel Blob automatically uses BLOB_READ_WRITE_TOKEN from environment
    this.baseUrl =
      process.env.BLOB_STORE_URL || "https://blob.vercel-storage.com";
  }

  /**
   * Upload audio buffer to Vercel Blob storage
   */
  async uploadAudio(
    audioBuffer: Buffer,
    episodeId: string,
    options?: BlobUploadOptions
  ): Promise<BlobUploadResult> {
    const startTime = Date.now();

    try {
      // Generate filename
      const timestamp = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
      const randomSuffix =
        options?.addRandomSuffix !== false ? `-${createId().slice(0, 8)}` : "";
      const filename =
        options?.filename ||
        `episode-${episodeId}-${timestamp}${randomSuffix}.mp3`;

      // Determine content type
      const contentType = options?.contentType || "audio/mpeg";

      // Upload to Vercel Blob
      const blob = await put(filename, audioBuffer, {
        access: "public",
        contentType,
      });

      return {
        success: true,
        url: blob.url,
        pathname: blob.pathname,
        size: audioBuffer.length, // Use buffer length since blob.size might not be available
        metadata: {
          uploadTime: Date.now() - startTime,
          contentType,
          filename,
        },
      };
    } catch (error) {
      console.error("Blob upload error:", error);

      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown upload error",
        metadata: {
          uploadTime: Date.now() - startTime,
          contentType: options?.contentType || "audio/mpeg",
          filename: options?.filename || `episode-${episodeId}`,
        },
      };
    }
  }

  /**
   * Delete audio file from Vercel Blob storage
   */
  async deleteAudio(url: string): Promise<BlobDeleteResult> {
    try {
      await del(url);

      return {
        success: true,
      };
    } catch (error) {
      console.error("Blob delete error:", error);

      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown delete error",
      };
    }
  }

  /**
   * Get information about a blob file
   */
  async getAudioInfo(url: string): Promise<BlobInfoResult> {
    try {
      const info = await head(url);

      return {
        success: true,
        exists: true,
        size: info.size,
        contentType: info.contentType,
        uploadedAt: info.uploadedAt,
      };
    } catch (error) {
      console.error("Blob info error:", error);

      // If the error is 404, the file doesn't exist
      if (error instanceof Error && error.message.includes("404")) {
        return {
          success: true,
          exists: false,
        };
      }

      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown info error",
      };
    }
  }

  /**
   * Generate a unique filename for an episode
   */
  generateFilename(episodeId: string, extension: string = "mp3"): string {
    const timestamp = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
    const randomSuffix = createId().slice(0, 8);
    return `episode-${episodeId}-${timestamp}-${randomSuffix}.${extension}`;
  }

  /**
   * Validate audio buffer before upload
   */
  validateAudioBuffer(buffer: Buffer): { valid: boolean; error?: string } {
    if (!buffer || buffer.length === 0) {
      return { valid: false, error: "Empty audio buffer" };
    }

    // Check minimum size (1KB)
    if (buffer.length < 1024) {
      return { valid: false, error: "Audio buffer too small (minimum 1KB)" };
    }

    // Check maximum size (50MB)
    const maxSize = 50 * 1024 * 1024; // 50MB
    if (buffer.length > maxSize) {
      return { valid: false, error: "Audio buffer too large (maximum 50MB)" };
    }

    return { valid: true };
  }

  /**
   * Get storage usage statistics (if available)
   */
  async getStorageStats(): Promise<{
    success: boolean;
    totalFiles?: number;
    totalSize?: number;
    error?: string;
  }> {
    try {
      // Note: Vercel Blob doesn't provide a direct API for listing all files
      // This would need to be tracked separately in your database
      return {
        success: true,
        totalFiles: 0,
        totalSize: 0,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown stats error",
      };
    }
  }
}
