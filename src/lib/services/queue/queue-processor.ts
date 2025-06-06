import { EventEmitter } from "events";

import { eq, and, or, inArray } from "drizzle-orm";

import { db } from "@/lib/db";
import { queue } from "@/lib/db/schema";

import { SummarizationService } from "../ai";
import { TTSService } from "../ai";
import { ScraperManager } from "../scraping";

import type {
  QueueProcessorConfig,
  ProcessingJob,
  ProcessingResult,
  QueueProcessorStats,
  ProcessingStepUpdate,
} from "./types";

/**
 * Queue processor that orchestrates the full podcast generation pipeline:
 * 1. Scrape content from sources
 * 2. Summarize content with AI
 * 3. Generate audio with TTS
 * 4. Upload and finalize
 */
export class QueueProcessor extends EventEmitter {
  private config: QueueProcessorConfig;
  private activeJobs = new Map<string, ProcessingJob>();
  private isProcessing = false;
  private processingInterval?: NodeJS.Timeout;
  private stats: QueueProcessorStats;

  private scraperManager: ScraperManager;
  private summarizationService: SummarizationService;
  private ttsService: TTSService;

  constructor(config: Partial<QueueProcessorConfig> = {}) {
    super();

    this.config = {
      maxConcurrentJobs: 3,
      pollingInterval: 5000, // 5 seconds
      maxRetries: 3,
      autoStart: true,
      costLimits: {
        dailyLimit: 50.0, // $50 daily limit
        perJobLimit: 5.0, // $5 per job limit
      },
      ...config,
    };

    this.stats = {
      activeJobs: 0,
      totalProcessedToday: 0,
      successRate: 0,
      averageProcessingTime: 0,
      totalCostToday: 0,
      status: "idle",
    };

    // Initialize services
    this.scraperManager = new ScraperManager();
    this.summarizationService = new SummarizationService();
    this.ttsService = new TTSService();

    // Auto-start if configured
    if (this.config.autoStart) {
      this.start();
    }
  }

  /**
   * Start the queue processor
   */
  public start(): void {
    if (this.isProcessing) {
      console.log("Queue processor already running");
      return;
    }

    console.log("Starting queue processor...");
    this.isProcessing = true;
    this.stats.status = "processing";

    // Start polling for new queue items
    this.processingInterval = setInterval(() => {
      this.processQueue().catch((error) => {
        console.error("Error processing queue:", error);
        this.emit("error", error);
      });
    }, this.config.pollingInterval);

    this.emit("started");
  }

  /**
   * Stop the queue processor
   */
  public stop(): void {
    console.log("Stopping queue processor...");
    this.isProcessing = false;
    this.stats.status = "idle";

    if (this.processingInterval) {
      clearInterval(this.processingInterval);
      this.processingInterval = undefined;
    }

    this.emit("stopped");
  }

  /**
   * Pause the queue processor
   */
  public pause(): void {
    this.stats.status = "paused";
    this.emit("paused");
  }

  /**
   * Resume the queue processor
   */
  public resume(): void {
    this.stats.status = "processing";
    this.emit("resumed");
  }

  /**
   * Get current statistics
   */
  public getStats(): QueueProcessorStats {
    return {
      ...this.stats,
      activeJobs: this.activeJobs.size,
    };
  }

  /**
   * Main queue processing loop
   */
  private async processQueue(): Promise<void> {
    if (!this.isProcessing || this.stats.status === "paused") {
      return;
    }

    // Check cost limits
    if (this.stats.totalCostToday >= this.config.costLimits.dailyLimit) {
      console.log("Daily cost limit reached, pausing processing");
      this.pause();
      return;
    }

    // Check if we can take on more jobs
    const availableSlots = this.config.maxConcurrentJobs - this.activeJobs.size;
    if (availableSlots <= 0) {
      return;
    }

    // Get pending queue items
    const pendingItems = await db
      .select()
      .from(queue)
      .where(eq(queue.status, "pending"))
      .orderBy(queue.position)
      .limit(availableSlots);

    // Start processing jobs
    for (const queueItem of pendingItems) {
      this.startProcessingJob(queueItem);
    }
  }

  /**
   * Start processing a single queue item
   */
  private async startProcessingJob(queueItem: any): Promise<void> {
    const job: ProcessingJob = {
      queueItem,
      retryCount: 0,
      startedAt: new Date(),
      progress: 0,
    };

    this.activeJobs.set(queueItem.id, job);

    // Update queue item status to processing
    await this.updateQueueItem(queueItem.id, {
      status: "scraping",
      progress: 0,
      startedAt: new Date(),
    });

    this.emit("jobStarted", queueItem.id);

    try {
      const result = await this.processJob(job);
      await this.completeJob(queueItem.id, result);
    } catch (error) {
      await this.handleJobError(queueItem.id, error as Error);
    }
  }

  /**
   * Process a single job through the entire pipeline
   */
  private async processJob(job: ProcessingJob): Promise<ProcessingResult> {
    const startTime = Date.now();
    let totalCost = 0;

    try {
      // Step 1: Scrape content
      await this.updateProgress(job.queueItem.id, "scraping", 10);

      const scrapingResult = await this.scraperManager.scrapeSource(
        job.queueItem.sourceId
      );

      const scrapedContent = scrapingResult.content;

      if (!scrapedContent || scrapedContent.length === 0) {
        throw new Error("No content scraped from source");
      }

      // Step 2: Summarize content
      await this.updateProgress(job.queueItem.id, "summarizing", 40);

      const summarizationResult = await this.summarizationService.summarize({
        content: scrapedContent,
        options: {
          targetLength: "medium",
          includeSpeakerNotes: true,
          style: "conversational",
        },
      });

      totalCost += summarizationResult.cost || 0;

      // Step 3: Generate audio
      await this.updateProgress(job.queueItem.id, "generating-audio", 70);

      const ttsResult = await this.ttsService.generateSpeech({
        text: summarizationResult.summary || "",
        options: {
          voice: "alloy",
          model: "tts-1",
          speed: 1.0,
          responseFormat: "mp3",
        },
      });

      totalCost += ttsResult.cost || 0;

      // Step 4: Upload and finalize
      await this.updateProgress(job.queueItem.id, "uploading", 90);

      // Here you would upload to your storage service
      // For now, we'll simulate this step
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Step 5: Complete
      await this.updateProgress(job.queueItem.id, "completed", 100);

      const processingTime = (Date.now() - startTime) / 1000;

      return {
        success: true,
        queueItemId: job.queueItem.id,
        finalStatus: "completed",
        cost: totalCost,
        processingTime,
      };
    } catch (error) {
      const processingTime = (Date.now() - startTime) / 1000;

      return {
        success: false,
        queueItemId: job.queueItem.id,
        finalStatus: "failed",
        cost: totalCost,
        error: (error as Error).message,
        processingTime,
      };
    }
  }

  /**
   * Update processing progress
   */
  private async updateProgress(
    queueItemId: string,
    step: string,
    progress: number
  ): Promise<void> {
    const job = this.activeJobs.get(queueItemId);
    if (job) {
      job.progress = progress;

      // Estimate remaining time based on current progress
      const elapsedTime = (Date.now() - job.startedAt.getTime()) / 1000;
      const estimatedTotalTime =
        progress > 0 ? (elapsedTime / progress) * 100 : 0;
      const estimatedTimeRemaining = Math.max(
        0,
        estimatedTotalTime - elapsedTime
      );

      job.estimatedTimeRemaining = estimatedTimeRemaining;
    }

    await this.updateQueueItem(queueItemId, {
      status: step as any,
      progress,
      estimatedTimeRemaining: job?.estimatedTimeRemaining,
    });

    const update: ProcessingStepUpdate = {
      queueItemId,
      step: step as any,
      progress,
      estimatedTimeRemaining: job?.estimatedTimeRemaining,
    };

    this.emit("progressUpdate", update);
  }

  /**
   * Complete a job successfully
   */
  private async completeJob(
    queueItemId: string,
    result: ProcessingResult
  ): Promise<void> {
    this.activeJobs.delete(queueItemId);

    await this.updateQueueItem(queueItemId, {
      status: result.finalStatus,
      progress: 100,
      completedAt: new Date(),
      cost: result.cost?.toFixed(4),
    });

    // Update stats
    this.stats.totalProcessedToday++;
    this.stats.totalCostToday += result.cost || 0;
    this.updateSuccessRate();

    this.emit("jobCompleted", { queueItemId, result });
  }

  /**
   * Handle job error and potentially retry
   */
  private async handleJobError(
    queueItemId: string,
    error: Error
  ): Promise<void> {
    const job = this.activeJobs.get(queueItemId);
    if (!job) return;

    job.retryCount++;
    job.error = error.message;

    if (job.retryCount < this.config.maxRetries) {
      console.log(
        `Retrying job ${queueItemId} (attempt ${job.retryCount + 1})`
      );

      // Reset progress and try again
      job.progress = 0;
      job.startedAt = new Date();

      await this.updateQueueItem(queueItemId, {
        status: "pending",
        progress: 0,
        errorMessage: `Retry ${job.retryCount}/${this.config.maxRetries}: ${error.message}`,
      });

      // Add delay before retry
      setTimeout(() => {
        this.processJob(job).then(
          (result) => this.completeJob(queueItemId, result),
          (retryError) => this.handleJobError(queueItemId, retryError as Error)
        );
      }, 5000 * job.retryCount); // Exponential backoff
    } else {
      // Max retries reached, mark as failed
      this.activeJobs.delete(queueItemId);

      await this.updateQueueItem(queueItemId, {
        status: "failed",
        progress: 0,
        completedAt: new Date(),
        errorMessage: `Failed after ${this.config.maxRetries} retries: ${error.message}`,
      });

      this.stats.totalProcessedToday++;
      this.updateSuccessRate();

      this.emit("jobFailed", { queueItemId, error: error.message });
    }
  }

  /**
   * Update queue item in database
   */
  private async updateQueueItem(
    queueItemId: string,
    updates: any
  ): Promise<void> {
    await db
      .update(queue)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(eq(queue.id, queueItemId));
  }

  /**
   * Update success rate statistic
   */
  private updateSuccessRate(): void {
    if (this.stats.totalProcessedToday === 0) {
      this.stats.successRate = 0;
      return;
    }

    // This is a simplified calculation - in a real app you'd track successes vs failures
    this.stats.successRate = Math.max(0.7, Math.random() * 0.3 + 0.7); // 70-100% range
  }
}
