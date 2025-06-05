import { eq, desc, asc, sql, and } from "drizzle-orm";
import { z } from "zod";

import { queue, episodes, sources } from "../../db/connection";
import { createTRPCRouter, publicProcedure } from "../server";

// Input validation schemas
const createQueueItemSchema = z.object({
  episodeId: z.string().min(1),
  episodeTitle: z.string().min(1).max(500),
  sourceId: z.string().min(1),
  sourceName: z.string().min(1).max(255),
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
    .default("pending"),
  progress: z.number().int().min(0).max(100).default(0),
  estimatedTimeRemaining: z.number().int().min(0).optional(),
  position: z.number().int().min(0),
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
  estimatedTimeRemaining: z.number().int().min(0).optional(),
  startedAt: z.date().optional(),
  completedAt: z.date().optional(),
  errorMessage: z.string().optional(),
  cost: z.string().optional(),
});

const getQueueSchema = z.object({
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
  limit: z.number().int().min(1).max(100).default(50),
});

export const queueRouter = createTRPCRouter({
  // Get all queue items with optional filtering
  getAll: publicProcedure
    .input(getQueueSchema)
    .query(async ({ ctx, input }) => {
      const { status, limit } = input;

      const conditions = [];
      if (status) conditions.push(eq(queue.status, status));

      const whereClause =
        conditions.length > 0 ? and(...conditions) : undefined;

      const queueItems = await ctx.db
        .select({
          queueItem: queue,
          episode: episodes,
          source: sources,
        })
        .from(queue)
        .leftJoin(episodes, eq(queue.episodeId, episodes.id))
        .leftJoin(sources, eq(queue.sourceId, sources.id))
        .where(whereClause)
        .orderBy(asc(queue.position))
        .limit(limit);

      return queueItems.map(({ queueItem, episode, source }) => ({
        ...queueItem,
        episode: episode || undefined,
        source: source || undefined,
      }));
    }),

  // Get queue item by ID
  getById: publicProcedure
    .input(z.object({ id: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      const [result] = await ctx.db
        .select({
          queueItem: queue,
          episode: episodes,
          source: sources,
        })
        .from(queue)
        .leftJoin(episodes, eq(queue.episodeId, episodes.id))
        .leftJoin(sources, eq(queue.sourceId, sources.id))
        .where(eq(queue.id, input.id))
        .limit(1);

      if (!result) {
        throw new Error("Queue item not found");
      }

      return {
        ...result.queueItem,
        episode: result.episode || undefined,
        source: result.source || undefined,
      };
    }),

  // Get currently processing items
  getProcessing: publicProcedure.query(async ({ ctx }) => {
    const processingItems = await ctx.db
      .select({
        queueItem: queue,
        episode: episodes,
        source: sources,
      })
      .from(queue)
      .leftJoin(episodes, eq(queue.episodeId, episodes.id))
      .leftJoin(sources, eq(queue.sourceId, sources.id))
      .where(
        and(
          sql`${queue.status} IN ('scraping', 'summarizing', 'generating-audio', 'uploading')`,
          sql`${queue.startedAt} IS NOT NULL`
        )
      )
      .orderBy(asc(queue.startedAt));

    return processingItems.map(({ queueItem, episode, source }) => ({
      ...queueItem,
      episode: episode || undefined,
      source: source || undefined,
    }));
  }),

  // Get pending items
  getPending: publicProcedure.query(async ({ ctx }) => {
    const pendingItems = await ctx.db
      .select({
        queueItem: queue,
        episode: episodes,
        source: sources,
      })
      .from(queue)
      .leftJoin(episodes, eq(queue.episodeId, episodes.id))
      .leftJoin(sources, eq(queue.sourceId, sources.id))
      .where(eq(queue.status, "pending"))
      .orderBy(asc(queue.position));

    return pendingItems.map(({ queueItem, episode, source }) => ({
      ...queueItem,
      episode: episode || undefined,
      source: source || undefined,
    }));
  }),

  // Get queue statistics
  getStats: publicProcedure.query(async ({ ctx }) => {
    const stats = await ctx.db
      .select({
        totalInQueue: sql<number>`count(*)`,
        pending: sql<number>`count(*) filter (where status = 'pending')`,
        processing: sql<number>`count(*) filter (where status IN ('scraping', 'summarizing', 'generating-audio', 'uploading'))`,
        completed: sql<number>`count(*) filter (where status = 'completed')`,
        failed: sql<number>`count(*) filter (where status = 'failed')`,
        totalCost: sql<string>`sum(cost)`,
        avgProgress: sql<number>`avg(progress) filter (where status IN ('scraping', 'summarizing', 'generating-audio', 'uploading'))`,
      })
      .from(queue);

    const result = stats[0] || {
      totalInQueue: 0,
      pending: 0,
      processing: 0,
      completed: 0,
      failed: 0,
      totalCost: "0",
      avgProgress: 0,
    };

    // Calculate estimated wait time (simplified)
    const avgProcessingTime = 180; // 3 minutes default
    const estimatedWaitTime = result.pending * avgProcessingTime;

    return {
      ...result,
      currentlyProcessing: result.processing,
      averageProcessingTime: avgProcessingTime,
      estimatedWaitTime,
      successRate:
        result.totalInQueue > 0
          ? result.completed / (result.completed + result.failed) || 0
          : 0,
      totalCostToday: parseFloat(result.totalCost || "0"),
    };
  }),

  // Add item to queue
  add: publicProcedure
    .input(createQueueItemSchema)
    .mutation(async ({ ctx, input }) => {
      const [newQueueItem] = await ctx.db
        .insert(queue)
        .values(input)
        .returning();

      return newQueueItem;
    }),

  // Update queue item
  update: publicProcedure
    .input(updateQueueItemSchema)
    .mutation(async ({ ctx, input }) => {
      const { id, ...updateData } = input;

      const [updatedQueueItem] = await ctx.db
        .update(queue)
        .set({
          ...updateData,
          updatedAt: new Date(),
        })
        .where(eq(queue.id, id))
        .returning();

      if (!updatedQueueItem) {
        throw new Error("Queue item not found");
      }

      return updatedQueueItem;
    }),

  // Start processing a queue item
  startProcessing: publicProcedure
    .input(
      z.object({
        id: z.string().min(1),
        status: z.enum([
          "scraping",
          "summarizing",
          "generating-audio",
          "uploading",
        ]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const [updatedQueueItem] = await ctx.db
        .update(queue)
        .set({
          status: input.status,
          startedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(queue.id, input.id))
        .returning();

      if (!updatedQueueItem) {
        throw new Error("Queue item not found");
      }

      return updatedQueueItem;
    }),

  // Complete a queue item
  complete: publicProcedure
    .input(
      z.object({
        id: z.string().min(1),
        cost: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const [updatedQueueItem] = await ctx.db
        .update(queue)
        .set({
          status: "completed",
          progress: 100,
          completedAt: new Date(),
          cost: input.cost,
          updatedAt: new Date(),
        })
        .where(eq(queue.id, input.id))
        .returning();

      if (!updatedQueueItem) {
        throw new Error("Queue item not found");
      }

      return updatedQueueItem;
    }),

  // Fail a queue item
  fail: publicProcedure
    .input(
      z.object({
        id: z.string().min(1),
        errorMessage: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const [updatedQueueItem] = await ctx.db
        .update(queue)
        .set({
          status: "failed",
          errorMessage: input.errorMessage,
          completedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(queue.id, input.id))
        .returning();

      if (!updatedQueueItem) {
        throw new Error("Queue item not found");
      }

      return updatedQueueItem;
    }),

  // Remove item from queue
  remove: publicProcedure
    .input(z.object({ id: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const [deletedQueueItem] = await ctx.db
        .delete(queue)
        .where(eq(queue.id, input.id))
        .returning();

      if (!deletedQueueItem) {
        throw new Error("Queue item not found");
      }

      return { success: true };
    }),

  // Clear completed items
  clearCompleted: publicProcedure.mutation(async ({ ctx }) => {
    const deletedItems = await ctx.db
      .delete(queue)
      .where(eq(queue.status, "completed"))
      .returning();

    return {
      success: true,
      deletedCount: deletedItems.length,
    };
  }),
});
