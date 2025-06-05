import { eq, desc, asc, sql, and, count } from "drizzle-orm";
import { z } from "zod";

import { db, queue, episodes, sources } from "../../db";
import { createTRPCRouter, publicProcedure } from "../server";

// Input validation schemas
const getQueueSchema = z.object({
  limit: z.number().int().min(1).max(50).default(20),
  offset: z.number().int().min(0).default(0),
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
    .optional()
    .describe("Filter by queue status"),
});

const createQueueItemSchema = z.object({
  episodeId: z.string().min(1),
  episodeTitle: z.string().min(1).max(500),
  sourceId: z.string().min(1),
  sourceName: z.string().min(1).max(255),
  position: z.number().int().min(0),
  estimatedTimeRemaining: z.number().int().positive().optional(),
});

const updateQueueItemSchema = z.object({
  id: z.string().min(1),
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
  progress: z.number().int().min(0).max(100).optional(),
  estimatedTimeRemaining: z.number().int().positive().optional(),
  startedAt: z.date().optional(),
  completedAt: z.date().optional(),
  errorMessage: z.string().optional(),
  cost: z.string().optional(),
});

export const queueRouter = createTRPCRouter({
  // Get all queue items with filtering
  getAll: publicProcedure
    .meta({
      description: "Retrieve all queue items with filtering and pagination.",
    })
    .input(getQueueSchema)
    .query(async ({ input }) => {
      const { limit, offset, status } = input;

      // Build where conditions
      const conditions = [];
      if (status) {
        conditions.push(eq(queue.status, status));
      }

      // Get queue items with episode and source info
      const queueItems = await db
        .select({
          id: queue.id,
          episodeId: queue.episodeId,
          episodeTitle: queue.episodeTitle,
          sourceId: queue.sourceId,
          sourceName: queue.sourceName,
          status: queue.status,
          progress: queue.progress,
          estimatedTimeRemaining: queue.estimatedTimeRemaining,
          startedAt: queue.startedAt,
          completedAt: queue.completedAt,
          errorMessage: queue.errorMessage,
          cost: queue.cost,
          position: queue.position,
          createdAt: queue.createdAt,
          updatedAt: queue.updatedAt,
          // Additional episode and source details
          episodeStatus: episodes.status,
          sourceActive: sources.active,
        })
        .from(queue)
        .innerJoin(episodes, eq(queue.episodeId, episodes.id))
        .innerJoin(sources, eq(queue.sourceId, sources.id))
        .where(conditions.length > 0 ? and(...conditions) : undefined)
        .orderBy(queue.position, desc(queue.createdAt))
        .limit(limit)
        .offset(offset);

      // Get total count
      const [totalResult] = await db
        .select({ count: count() })
        .from(queue)
        .where(conditions.length > 0 ? and(...conditions) : undefined);

      const total = totalResult?.count ?? 0;

      return {
        queueItems,
        pagination: {
          total,
          limit,
          offset,
          hasMore: offset + limit < total,
        },
      };
    }),

  // Get current queue (active and pending items)
  getCurrent: publicProcedure
    .meta({
      description: "Get currently active and pending queue items.",
    })
    .query(async () => {
      const currentQueue = await db
        .select({
          id: queue.id,
          episodeTitle: queue.episodeTitle,
          sourceName: queue.sourceName,
          status: queue.status,
          progress: queue.progress,
          estimatedTimeRemaining: queue.estimatedTimeRemaining,
          position: queue.position,
          createdAt: queue.createdAt,
        })
        .from(queue)
        .where(
          sql`${queue.status} IN ('pending', 'scraping', 'summarizing', 'generating-audio', 'uploading')`
        )
        .orderBy(queue.position);

      return currentQueue;
    }),

  // Get queue item by ID
  getById: publicProcedure
    .meta({
      description: "Get a specific queue item by ID.",
    })
    .input(z.object({ id: z.string().min(1) }))
    .query(async ({ input }) => {
      const [queueItem] = await db
        .select({
          id: queue.id,
          episodeId: queue.episodeId,
          episodeTitle: queue.episodeTitle,
          sourceId: queue.sourceId,
          sourceName: queue.sourceName,
          status: queue.status,
          progress: queue.progress,
          estimatedTimeRemaining: queue.estimatedTimeRemaining,
          startedAt: queue.startedAt,
          completedAt: queue.completedAt,
          errorMessage: queue.errorMessage,
          cost: queue.cost,
          position: queue.position,
          createdAt: queue.createdAt,
          updatedAt: queue.updatedAt,
          // Episode and source details
          episodeStatus: episodes.status,
          episodeSummary: episodes.summary,
          sourceUrl: sources.url,
          sourceCategory: sources.category,
        })
        .from(queue)
        .innerJoin(episodes, eq(queue.episodeId, episodes.id))
        .innerJoin(sources, eq(queue.sourceId, sources.id))
        .where(eq(queue.id, input.id));

      if (!queueItem) {
        throw new Error("Queue item not found");
      }

      return queueItem;
    }),

  // Add item to queue
  add: publicProcedure
    .meta({
      description: "Add a new item to the generation queue.",
    })
    .input(createQueueItemSchema)
    .mutation(async ({ input }) => {
      const [newQueueItem] = await db.insert(queue).values(input).returning();

      return newQueueItem;
    }),

  // Update queue item
  update: publicProcedure
    .meta({
      description: "Update queue item status, progress, or other details.",
    })
    .input(updateQueueItemSchema)
    .mutation(async ({ input }) => {
      const { id, ...updateData } = input;

      const [updatedItem] = await db
        .update(queue)
        .set({
          ...updateData,
          updatedAt: new Date(),
        })
        .where(eq(queue.id, id))
        .returning();

      if (!updatedItem) {
        throw new Error("Queue item not found");
      }

      return updatedItem;
    }),

  // Update progress
  updateProgress: publicProcedure
    .meta({
      description: "Update progress and estimated time for a queue item.",
    })
    .input(
      z.object({
        id: z.string().min(1),
        progress: z.number().int().min(0).max(100),
        estimatedTimeRemaining: z.number().int().positive().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { id, progress, estimatedTimeRemaining } = input;

      const [updatedItem] = await db
        .update(queue)
        .set({
          progress,
          estimatedTimeRemaining,
          updatedAt: new Date(),
        })
        .where(eq(queue.id, id))
        .returning({
          id: queue.id,
          progress: queue.progress,
          estimatedTimeRemaining: queue.estimatedTimeRemaining,
        });

      if (!updatedItem) {
        throw new Error("Queue item not found");
      }

      return updatedItem;
    }),

  // Complete queue item
  complete: publicProcedure
    .meta({
      description: "Mark a queue item as completed.",
    })
    .input(
      z.object({
        id: z.string().min(1),
        cost: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { id, cost } = input;

      const [completedItem] = await db
        .update(queue)
        .set({
          status: "completed",
          progress: 100,
          completedAt: new Date(),
          cost,
          updatedAt: new Date(),
        })
        .where(eq(queue.id, id))
        .returning();

      if (!completedItem) {
        throw new Error("Queue item not found");
      }

      return completedItem;
    }),

  // Fail queue item
  fail: publicProcedure
    .meta({
      description: "Mark a queue item as failed with error message.",
    })
    .input(
      z.object({
        id: z.string().min(1),
        errorMessage: z.string().min(1),
      })
    )
    .mutation(async ({ input }) => {
      const { id, errorMessage } = input;

      const [failedItem] = await db
        .update(queue)
        .set({
          status: "failed",
          errorMessage,
          completedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(queue.id, id))
        .returning();

      if (!failedItem) {
        throw new Error("Queue item not found");
      }

      return failedItem;
    }),

  // Remove item from queue
  remove: publicProcedure
    .meta({
      description: "Remove an item from the queue.",
    })
    .input(z.object({ id: z.string().min(1) }))
    .mutation(async ({ input }) => {
      const [deletedItem] = await db
        .delete(queue)
        .where(eq(queue.id, input.id))
        .returning();

      if (!deletedItem) {
        throw new Error("Queue item not found");
      }

      return { success: true };
    }),

  // Clear completed items
  clearCompleted: publicProcedure
    .meta({
      description: "Remove all completed items from the queue.",
    })
    .mutation(async () => {
      const deletedItems = await db
        .delete(queue)
        .where(eq(queue.status, "completed"))
        .returning({ id: queue.id });

      return {
        success: true,
        deletedCount: deletedItems.length,
      };
    }),

  // Get queue statistics
  getStats: publicProcedure
    .meta({
      description: "Get queue statistics and counts by status.",
    })
    .query(async () => {
      const [
        totalResult,
        pendingResult,
        activeResult,
        completedResult,
        failedResult,
      ] = await Promise.all([
        db.select({ count: count() }).from(queue),
        db
          .select({ count: count() })
          .from(queue)
          .where(eq(queue.status, "pending")),
        db
          .select({ count: count() })
          .from(queue)
          .where(
            sql`${queue.status} IN ('scraping', 'summarizing', 'generating-audio', 'uploading')`
          ),
        db
          .select({ count: count() })
          .from(queue)
          .where(eq(queue.status, "completed")),
        db
          .select({ count: count() })
          .from(queue)
          .where(eq(queue.status, "failed")),
      ]);

      // Calculate total cost
      const costResult = await db
        .select({ cost: queue.cost })
        .from(queue)
        .where(eq(queue.status, "completed"));

      const totalCost = costResult.reduce(
        (sum, item) => sum + Number(item.cost || 0),
        0
      );

      return {
        total: totalResult[0]?.count ?? 0,
        pending: pendingResult[0]?.count ?? 0,
        active: activeResult[0]?.count ?? 0,
        completed: completedResult[0]?.count ?? 0,
        failed: failedResult[0]?.count ?? 0,
        totalCost: totalCost.toFixed(2),
      };
    }),

  // Reorder queue positions
  reorder: publicProcedure
    .meta({
      description: "Reorder queue items by updating their positions.",
    })
    .input(
      z.object({
        itemIds: z.array(z.string()).min(1),
      })
    )
    .mutation(async ({ input }) => {
      const { itemIds } = input;

      // Update positions in a transaction
      const updates = itemIds.map((id, index) =>
        db
          .update(queue)
          .set({
            position: index,
            updatedAt: new Date(),
          })
          .where(eq(queue.id, id))
      );

      await Promise.all(updates);

      return { success: true };
    }),
});
