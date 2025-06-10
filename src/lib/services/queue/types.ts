import { type QueueItem } from "@/lib/db/schema";

/**
 * Configuration for the queue processor
 */
export interface QueueProcessorConfig {
  /** Enable auto-start processing */
  autoStart: boolean;
  /** Cost limits */
  costLimits: {
    dailyLimit: number;
    perJobLimit: number;
  };
  /** Maximum number of concurrent jobs */
  maxConcurrentJobs: number;
  /** Maximum retry attempts for failed jobs */
  maxRetries: number;
  /** Polling interval in milliseconds */
  pollingInterval: number;
}

/**
 * Internal processing job representation
 */
export interface ProcessingJob {
  /** Error details if failed */
  error?: string;
  /** Estimated time remaining in seconds */
  estimatedTimeRemaining?: number;
  /** Processing progress (0-100) */
  progress: number;
  /** Queue item being processed */
  queueItem: QueueItem;
  /** Current retry count */
  retryCount: number;
  /** Processing start time */
  startedAt: Date;
}

/**
 * Processing step types
 */
export type ProcessingStep =
  | "completed"
  | "generating-audio"
  | "scraping"
  | "summarizing"
  | "uploading";

/**
 * Processing result
 */
export interface ProcessingResult {
  cost?: number;
  error?: string;
  finalStatus: "completed" | "failed";
  processingTime: number;
  queueItemId: string;
  success: boolean;
}

/**
 * Queue processor statistics
 */
export interface QueueProcessorStats {
  /** Currently processing jobs */
  activeJobs: number;
  /** Average processing time in seconds */
  averageProcessingTime: number;
  /** Queue processor status */
  status: "error" | "idle" | "paused" | "processing";
  /** Success rate (0-1) */
  successRate: number;
  /** Total cost today */
  totalCostToday: number;
  /** Total jobs processed today */
  totalProcessedToday: number;
}

/**
 * Processing step update
 */
export interface ProcessingStepUpdate {
  error?: string;
  estimatedTimeRemaining?: number;
  progress: number;
  queueItemId: string;
  step: ProcessingStep;
}
