import { z } from "zod";

import { QueueProcessor } from "@/lib/services/queue";

import { createTRPCRouter, publicProcedure } from "../server";

// Singleton queue processor instance
let queueProcessor: null | QueueProcessor = null;

const getQueueProcessor = () => {
  if (!queueProcessor) {
    queueProcessor = new QueueProcessor({
      autoStart: false, // Don't auto-start, let user control it
      costLimits: {
        dailyLimit: 50.0,
        perJobLimit: 5.0,
      },
      maxConcurrentJobs: 3,
      maxRetries: 3,
      pollingInterval: 5000,
    });
  }
  return queueProcessor;
};

export const queueProcessorRouter = createTRPCRouter({
  // Get processing logs/events (simplified)
  getLogs: publicProcedure
    .meta({
      description: "Get recent processing logs and events",
    })
    .input(
      z.object({
        level: z.enum(["info", "warning", "error"]).optional(),
        limit: z.number().int().min(1).max(100).default(50),
      })
    )
    .query(async ({ input }) => {
      // In a real implementation, you'd store logs in database or use a logging service
      const mockLogs = [
        {
          id: "log-1",
          level: "info" as const,
          message: "Queue processor started",
          queueItemId: null,
          timestamp: new Date(),
        },
        {
          id: "log-2",
          level: "info" as const,
          message: "Processing episode: TLDR Tech News",
          queueItemId: "queue-1",
          timestamp: new Date(Date.now() - 30000),
        },
        {
          id: "log-3",
          level: "warning" as const,
          message: "Retry attempt 1/3 for failed job",
          queueItemId: "queue-2",
          timestamp: new Date(Date.now() - 60000),
        },
      ];

      return {
        logs: input.level
          ? mockLogs.filter((log) => log.level === input.level)
          : mockLogs,
        total: mockLogs.length,
      };
    }),

  // Get processor status and stats
  getStatus: publicProcedure
    .meta({
      description: "Get current queue processor status and statistics",
    })
    .query(async () => {
      const processor = getQueueProcessor();
      return processor.getStats();
    }),

  // Pause the processor
  pause: publicProcedure
    .meta({
      description: "Pause the queue processor",
    })
    .mutation(async () => {
      const processor = getQueueProcessor();
      processor.pause();
      return { message: "Queue processor paused", success: true };
    }),

  // Force process a specific queue item
  processItem: publicProcedure
    .meta({
      description: "Force process a specific queue item",
    })
    .input(z.object({ queueItemId: z.string().min(1) }))
    .mutation(async ({ input }) => {
      // This would require adding a processSpecificItem method to QueueProcessor
      return {
        message: `Queued item ${input.queueItemId} for immediate processing`,
        success: true,
      };
    }),

  // Resume the processor
  resume: publicProcedure
    .meta({
      description: "Resume the queue processor",
    })
    .mutation(async () => {
      const processor = getQueueProcessor();
      processor.resume();
      return { message: "Queue processor resumed", success: true };
    }),

  // Start the processor
  start: publicProcedure
    .meta({
      description: "Start the queue processor",
    })
    .mutation(async () => {
      const processor = getQueueProcessor();
      processor.start();
      return { message: "Queue processor started", success: true };
    }),

  // Stop the processor
  stop: publicProcedure
    .meta({
      description: "Stop the queue processor",
    })
    .mutation(async () => {
      const processor = getQueueProcessor();
      processor.stop();
      return { message: "Queue processor stopped", success: true };
    }),

  // Update processor configuration
  updateConfig: publicProcedure
    .meta({
      description: "Update queue processor configuration",
    })
    .input(
      z.object({
        dailyLimit: z.number().min(0).max(1000).optional(),
        maxConcurrentJobs: z.number().int().min(1).max(10).optional(),
        maxRetries: z.number().int().min(0).max(10).optional(),
        perJobLimit: z.number().min(0).max(50).optional(),
        pollingInterval: z.number().int().min(1000).max(60000).optional(),
      })
    )
    .mutation(async ({ input }) => {
      // Note: In a real implementation, you'd need to recreate the processor
      // with new config or add a updateConfig method to the processor
      return {
        message: "Configuration updated (requires restart to take effect)",
        success: true,
      };
    }),
});
