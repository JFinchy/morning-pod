import { createId } from "@paralleldrive/cuid2";
import { del, head, put } from "@vercel/blob";

export interface BlobUploadOptions {
  addRandomSuffix?: boolean;
  contentType?: string;
  filename?: string;
}

export interface BlobUploadResult {
  error?: string;
  metadata?: {
    contentType: string;
    filename: string;
    uploadTime: number;
  };
  pathname?: string;
  size?: number;
  success: boolean;
  url?: string;
}

export interface BlobDeleteResult {
  error?: string;
  success: boolean;
}

export interface BlobInfoResult {
  contentType?: string;
  error?: string;
  exists?: boolean;
  size?: number;
  success: boolean;
  uploadedAt?: Date;
}

export class BlobStorageService {
  private readonly baseUrl: string;

  constructor() {
    // Vercel Blob automatically uses BLOB_READ_WRITE_TOKEN from environment
    this.baseUrl =
      process.env.BLOB_STORE_URL || "https://blob.vercel-storage.com";
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
        error: error instanceof Error ? error.message : "Unknown delete error",
        success: false,
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
   * Get information about a blob file
   */
  async getAudioInfo(url: string): Promise<BlobInfoResult> {
    try {
      const info = await head(url);

      return {
        contentType: info.contentType,
        exists: true,
        size: info.size,
        success: true,
        uploadedAt: info.uploadedAt,
      };
    } catch (error) {
      console.error("Blob info error:", error);

      // If the error is 404, the file doesn't exist
      if (error instanceof Error && error.message.includes("404")) {
        return {
          exists: false,
          success: true,
        };
      }

      return {
        error: error instanceof Error ? error.message : "Unknown info error",
        success: false,
      };
    }
  }

  /**
   * Get storage usage statistics (if available)
   */
  async getStorageStats(): Promise<{
    error?: string;
    success: boolean;
    totalFiles?: number;
    totalSize?: number;
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
        error: error instanceof Error ? error.message : "Unknown stats error",
        success: false,
      };
    }
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
        metadata: {
          contentType,
          filename,
          uploadTime: Date.now() - startTime,
        },
        pathname: blob.pathname,
        size: audioBuffer.length, // Use buffer length since blob.size might not be available
        success: true,
        url: blob.url,
      };
    } catch (error) {
      console.error("Blob upload error:", error);

      return {
        error: error instanceof Error ? error.message : "Unknown upload error",
        metadata: {
          contentType: options?.contentType || "audio/mpeg",
          filename: options?.filename || `episode-${episodeId}`,
          uploadTime: Date.now() - startTime,
        },
        success: false,
      };
    }
  }

  /**
   * Validate audio buffer before upload
   */
  validateAudioBuffer(buffer: Buffer): { error?: string; valid: boolean } {
    if (!buffer || buffer.length === 0) {
      return { error: "Empty audio buffer", valid: false };
    }

    // Check minimum size (1KB)
    if (buffer.length < 1024) {
      return { error: "Audio buffer too small (minimum 1KB)", valid: false };
    }

    // Check maximum size (50MB)
    const maxSize = 50 * 1024 * 1024; // 50MB
    if (buffer.length > maxSize) {
      return { error: "Audio buffer too large (maximum 50MB)", valid: false };
    }

    return { valid: true };
  }
}
