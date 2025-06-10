import { and, count, desc, eq, sql } from "drizzle-orm";
import { z } from "zod";

import { db, episodes, queue, sources } from "../../db";
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
  estimatedTimeRemaining: z.number().int().positive().optional(),
  position: z.number().int().min(0),
  sourceId: z.string().min(1),
  sourceName: z.string().min(1).max(255),
});

const updateQueueItemSchema = z.object({
  completedAt: z.date().optional(),
  cost: z.string().optional(),
  errorMessage: z.string().optional(),
  estimatedTimeRemaining: z.number().int().positive().optional(),
  id: z.string().min(1),
  progress: z.number().int().min(0).max(100).optional(),
  startedAt: z.date().optional(),
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
});

export const queueRouter = createTRPCRouter({
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
        deletedCount: deletedItems.length,
        success: true,
      };
    }),

  // Complete queue item
  complete: publicProcedure
    .meta({
      description: "Mark a queue item as completed.",
    })
    .input(
      z.object({
        cost: z.string().optional(),
        id: z.string().min(1),
      })
    )
    .mutation(async ({ input }) => {
      const { cost, id } = input;

      const [completedItem] = await db
        .update(queue)
        .set({
          completedAt: new Date(),
          cost,
          progress: 100,
          status: "completed",
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
        errorMessage: z.string().min(1),
        id: z.string().min(1),
      })
    )
    .mutation(async ({ input }) => {
      const { errorMessage, id } = input;

      const [failedItem] = await db
        .update(queue)
        .set({
          completedAt: new Date(),
          errorMessage,
          status: "failed",
          updatedAt: new Date(),
        })
        .where(eq(queue.id, id))
        .returning();

      if (!failedItem) {
        throw new Error("Queue item not found");
      }

      return failedItem;
    }),

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
          completedAt: queue.completedAt,
          cost: queue.cost,
          createdAt: queue.createdAt,
          episodeId: queue.episodeId,
          // Additional episode and source details
          episodeStatus: episodes.status,
          episodeTitle: queue.episodeTitle,
          errorMessage: queue.errorMessage,
          estimatedTimeRemaining: queue.estimatedTimeRemaining,
          id: queue.id,
          position: queue.position,
          progress: queue.progress,
          sourceActive: sources.active,
          sourceId: queue.sourceId,
          sourceName: queue.sourceName,
          startedAt: queue.startedAt,
          status: queue.status,
          updatedAt: queue.updatedAt,
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
        pagination: {
          hasMore: offset + limit < total,
          limit,
          offset,
          total,
        },
        queueItems,
      };
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
          completedAt: queue.completedAt,
          cost: queue.cost,
          createdAt: queue.createdAt,
          episodeId: queue.episodeId,
          // Episode and source details
          episodeStatus: episodes.status,
          episodeSummary: episodes.summary,
          episodeTitle: queue.episodeTitle,
          errorMessage: queue.errorMessage,
          estimatedTimeRemaining: queue.estimatedTimeRemaining,
          id: queue.id,
          position: queue.position,
          progress: queue.progress,
          sourceCategory: sources.category,
          sourceId: queue.sourceId,
          sourceName: queue.sourceName,
          sourceUrl: sources.url,
          startedAt: queue.startedAt,
          status: queue.status,
          updatedAt: queue.updatedAt,
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

  // Get current queue (active and pending items)
  getCurrent: publicProcedure
    .meta({
      description: "Get currently active and pending queue items.",
    })
    .query(async () => {
      return await db
        .select({
          createdAt: queue.createdAt,
          episodeTitle: queue.episodeTitle,
          estimatedTimeRemaining: queue.estimatedTimeRemaining,
          id: queue.id,
          position: queue.position,
          progress: queue.progress,
          sourceName: queue.sourceName,
          status: queue.status,
        })
        .from(queue)
        .where(
          sql`${queue.status} IN ('pending', 'scraping', 'summarizing', 'generating-audio', 'uploading')`
        )
        .orderBy(queue.position);
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
        active: activeResult[0]?.count ?? 0,
        completed: completedResult[0]?.count ?? 0,
        failed: failedResult[0]?.count ?? 0,
        pending: pendingResult[0]?.count ?? 0,
        total: totalResult[0]?.count ?? 0,
        totalCost: totalCost.toFixed(2),
      };
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
        estimatedTimeRemaining: z.number().int().positive().optional(),
        id: z.string().min(1),
        progress: z.number().int().min(0).max(100),
      })
    )
    .mutation(async ({ input }) => {
      const { estimatedTimeRemaining, id, progress } = input;

      const [updatedItem] = await db
        .update(queue)
        .set({
          estimatedTimeRemaining,
          progress,
          updatedAt: new Date(),
        })
        .where(eq(queue.id, id))
        .returning({
          estimatedTimeRemaining: queue.estimatedTimeRemaining,
          id: queue.id,
          progress: queue.progress,
        });

      if (!updatedItem) {
        throw new Error("Queue item not found");
      }

      return updatedItem;
    }),
});
