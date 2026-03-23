import { createId } from "@paralleldrive/cuid2";
import { del, head, put } from "@vercel/blob";
import fs from "fs/promises";
import path from "path";

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
  private readonly isLocal: boolean;
  private readonly localPath: string;

  constructor() {
    // Vercel Blob automatically uses BLOB_READ_WRITE_TOKEN from environment
    this.baseUrl =
      process.env.BLOB_STORE_URL || "https://blob.vercel-storage.com";

    // Check if we should use local storage
    this.isLocal = !process.env.BLOB_READ_WRITE_TOKEN;
    this.localPath = path.join(process.cwd(), "public", "uploads", "audio");

    if (this.isLocal) {
      console.log("🛠️ Using local storage for audio files:", this.localPath);
      // Ensure local directory exists (async but constructor is sync, so we just log)
      this.ensureLocalDir().catch(console.error);
    }
  }

  private async ensureLocalDir() {
    try {
      await fs.mkdir(this.localPath, { recursive: true });
    } catch (error) {
      console.error("Failed to create local audio directory:", error);
    }
  }

  /**
   * Delete audio file
   */
  async deleteAudio(url: string): Promise<BlobDeleteResult> {
    try {
      if (this.isLocal) {
        const filename = path.basename(url);
        const filePath = path.join(this.localPath, filename);
        await fs.unlink(filePath);
      } else {
        await del(url);
      }

      return {
        success: true,
      };
    } catch (error) {
      console.error("Storage delete error:", error);

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
   * Get information about a file
   */
  async getAudioInfo(url: string): Promise<BlobInfoResult> {
    try {
      if (this.isLocal) {
        const filename = path.basename(url);
        const filePath = path.join(this.localPath, filename);
        const stats = await fs.stat(filePath);

        return {
          contentType: "audio/mpeg",
          exists: true,
          size: stats.size,
          success: true,
          uploadedAt: stats.mtime,
        };
      }

      const info = await head(url);

      return {
        contentType: info.contentType,
        exists: true,
        size: info.size,
        success: true,
        uploadedAt: info.uploadedAt,
      };
    } catch (error) {
      console.error("Storage info error:", error);

      // If the error is 404, the file doesn't exist
      if (
        error instanceof Error &&
        (error.message.includes("404") || (error as any).code === "ENOENT")
      ) {
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
   * Upload audio buffer
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

      if (this.isLocal) {
        await this.ensureLocalDir();
        const filePath = path.join(this.localPath, filename);
        await fs.writeFile(filePath, audioBuffer);

        // Return local relative URL
        const url = `/uploads/audio/${filename}`;

        return {
          metadata: {
            contentType,
            filename,
            uploadTime: Date.now() - startTime,
          },
          pathname: url,
          size: audioBuffer.length,
          success: true,
          url,
        };
      }

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
      console.error("Storage upload error:", error);

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
