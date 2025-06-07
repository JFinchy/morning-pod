import type { QueueItem } from "@/lib/db/schema";

/**
 * Configuration for the queue processor
 */
export interface QueueProcessorConfig {
  /** Maximum number of concurrent jobs */
  maxConcurrentJobs: number;
  /** Polling interval in milliseconds */
  pollingInterval: number;
  /** Maximum retry attempts for failed jobs */
  maxRetries: number;
  /** Enable auto-start processing */
  autoStart: boolean;
  /** Cost limits */
  costLimits: {
    dailyLimit: number;
    perJobLimit: number;
  };
}

/**
 * Internal processing job representation
 */
export interface ProcessingJob {
  /** Queue item being processed */
  queueItem: QueueItem;
  /** Current retry count */
  retryCount: number;
  /** Processing start time */
  startedAt: Date;
  /** Error details if failed */
  error?: string;
  /** Processing progress (0-100) */
  progress: number;
  /** Estimated time remaining in seconds */
  estimatedTimeRemaining?: number;
}

/**
 * Processing step types
 */
export type ProcessingStep =
  | "scraping"
  | "summarizing"
  | "generating-audio"
  | "uploading"
  | "completed";

/**
 * Processing result
 */
export interface ProcessingResult {
  success: boolean;
  queueItemId: string;
  finalStatus: "completed" | "failed";
  cost?: number;
  error?: string;
  processingTime: number;
}

/**
 * Queue processor statistics
 */
export interface QueueProcessorStats {
  /** Currently processing jobs */
  activeJobs: number;
  /** Total jobs processed today */
  totalProcessedToday: number;
  /** Success rate (0-1) */
  successRate: number;
  /** Average processing time in seconds */
  averageProcessingTime: number;
  /** Total cost today */
  totalCostToday: number;
  /** Queue processor status */
  status: "idle" | "processing" | "paused" | "error";
}

/**
 * Processing step update
 */
export interface ProcessingStepUpdate {
  queueItemId: string;
  step: ProcessingStep;
  progress: number;
  estimatedTimeRemaining?: number;
  error?: string;
}
