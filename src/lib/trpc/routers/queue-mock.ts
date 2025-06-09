import { z } from "zod";

import { mockGenerationStats, mockQueueItems } from "../../mock-data/queue";
import { createTRPCRouter, publicProcedure } from "../server-mock";

export const queueMockRouter = createTRPCRouter({
  // Get all queue items with optional filtering
  getAll: publicProcedure
    .input(
      z.object({
        limit: z.number().int().min(1).max(100).default(50),
        status: z
          .enum([
            "pending",
            "scraping",
            "summarizing",
            "generating-audio",
            "uploading",
            "completed",
            "failed",
          ])
          .optional(),
      })
    )
    .query(async ({ input }) => {
      const { limit, status } = input;

      let filteredItems = mockQueueItems;

      if (status) {
        filteredItems = filteredItems.filter((item) => item.status === status);
      }

      return filteredItems.slice(0, limit);
    }),

  // Get queue item by ID
  getById: publicProcedure
    .input(z.object({ id: z.string().min(1) }))
    .query(async ({ input }) => {
      const queueItem = mockQueueItems.find((item) => item.id === input.id);

      if (!queueItem) {
        throw new Error("Queue item not found");
      }

      return queueItem;
    }),

  // Get pending items
  getPending: publicProcedure.query(async () => {
    return mockQueueItems.filter((item) => item.status === "pending");
  }),

  // Get currently processing items
  getProcessing: publicProcedure.query(async () => {
    return mockQueueItems.filter((item) =>
      ["generating-audio", "scraping", "summarizing", "uploading"].includes(
        item.status
      )
    );
  }),

  // Get queue statistics
  getStats: publicProcedure.query(async () => {
    return mockGenerationStats;
  }),
});
