import { and, count, desc, eq, sql } from "drizzle-orm";
import { z } from "zod";

import { db } from "@/lib/db";
import { type NewScrapedContent, scrapedContent } from "@/lib/db/schema";

import { createTRPCRouter, publicProcedure } from "../server";

export const scrapedContentRouter = createTRPCRouter({
  // Delete old content (cleanup)
  cleanup: publicProcedure
    .input(
      z.object({
        olderThanDays: z.number().int().positive().default(30),
        status: z.enum(["raw", "processed", "archived"]).optional(),
      })
    )
    .meta({
      description: "Clean up old scraped content",
    })
    .mutation(async ({ input }) => {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - input.olderThanDays);

      const whereConditions = [
        sql`${scrapedContent.scrapedAt} < ${cutoffDate}`,
      ];

      if (input.status) {
        whereConditions.push(eq(scrapedContent.status, input.status));
      }

      const deleted = await db
        .delete(scrapedContent)
        .where(and(...whereConditions))
        .returning({ id: scrapedContent.id });

      return {
        deletedCount: deleted.length,
        deletedIds: deleted.map((item) => item.id),
        success: true,
      };
    }),

  // Save scraped content to database
  create: publicProcedure
    .input(
      z.object({
        category: z.string().min(1).max(100),
        content: z.string().min(1),
        contentHash: z.string().min(1).max(128),
        processingMetrics: z.record(z.any()).optional(),
        publishedAt: z.date(),
        source: z.string().min(1).max(255),
        sourceId: z.string().optional(),
        summary: z.string().min(1),
        tags: z.array(z.string()).optional(),
        title: z.string().min(1).max(1000),
        url: z.string().url(),
      })
    )
    .meta({
      description: "Save scraped content to the database",
    })
    .mutation(async ({ input }) => {
      const newContent: NewScrapedContent = {
        ...input,
        processingMetrics: input.processingMetrics
          ? JSON.stringify(input.processingMetrics)
          : null,
        tags: input.tags ? JSON.stringify(input.tags) : null,
      };

      const [created] = await db
        .insert(scrapedContent)
        .values(newContent)
        .returning();

      return {
        content: {
          ...created,
          processingMetrics: created.processingMetrics
            ? JSON.parse(created.processingMetrics)
            : null,
          tags: created.tags ? JSON.parse(created.tags) : [],
        },
        success: true,
      };
    }),

  // Batch save multiple scraped content items
  createBatch: publicProcedure
    .input(
      z.array(
        z.object({
          category: z.string().min(1).max(100),
          content: z.string().min(1),
          contentHash: z.string().min(1).max(128),
          processingMetrics: z.record(z.any()).optional(),
          publishedAt: z.date(),
          source: z.string().min(1).max(255),
          sourceId: z.string().optional(),
          summary: z.string().min(1),
          tags: z.array(z.string()).optional(),
          title: z.string().min(1).max(1000),
          url: z.string().url(),
        })
      )
    )
    .meta({
      description: "Save multiple scraped content items to the database",
    })
    .mutation(async ({ input }) => {
      const newContentItems: NewScrapedContent[] = input.map((item) => ({
        ...item,
        processingMetrics: item.processingMetrics
          ? JSON.stringify(item.processingMetrics)
          : null,
        tags: item.tags ? JSON.stringify(item.tags) : null,
      }));

      const created = await db
        .insert(scrapedContent)
        .values(newContentItems)
        .returning();

      return {
        content: created.map((item) => ({
          ...item,
          processingMetrics: item.processingMetrics
            ? JSON.parse(item.processingMetrics)
            : null,
          tags: item.tags ? JSON.parse(item.tags) : [],
        })),
        count: created.length,
        success: true,
      };
    }),

  // Delete content by ID
  delete: publicProcedure
    .input(z.object({ id: z.string() }))
    .meta({
      description: "Delete scraped content by ID",
    })
    .mutation(async ({ input }) => {
      const [deleted] = await db
        .delete(scrapedContent)
        .where(eq(scrapedContent.id, input.id))
        .returning({ id: scrapedContent.id });

      if (!deleted) {
        throw new Error("Content not found");
      }

      return {
        deletedId: deleted.id,
        success: true,
      };
    }),

  // Check if content exists by hash
  existsByHash: publicProcedure
    .input(z.object({ contentHash: z.string() }))
    .meta({
      description: "Check if content with given hash already exists",
    })
    .query(async ({ input }) => {
      const [existing] = await db
        .select({ id: scrapedContent.id })
        .from(scrapedContent)
        .where(eq(scrapedContent.contentHash, input.contentHash));

      return {
        exists: !!existing,
        id: existing?.id || null,
      };
    }),

  // Get all scraped content with pagination
  getAll: publicProcedure
    .input(
      z.object({
        category: z.string().optional(),
        page: z.number().int().positive().default(1),
        pageSize: z.number().int().positive().max(100).default(20),
        source: z.string().optional(),
        status: z.enum(["raw", "processed", "archived"]).optional(),
      })
    )
    .meta({
      description:
        "Get all scraped content with optional filtering and pagination",
    })
    .query(async ({ input }) => {
      const { category, page, pageSize, source, status } = input;
      const offset = (page - 1) * pageSize;

      // Build where conditions
      const whereConditions = [];
      if (source) {
        whereConditions.push(eq(scrapedContent.source, source));
      }
      if (category) {
        whereConditions.push(eq(scrapedContent.category, category));
      }
      if (status) {
        whereConditions.push(eq(scrapedContent.status, status));
      }

      const whereClause =
        whereConditions.length > 0 ? and(...whereConditions) : undefined;

      // Get content with pagination
      const content = await db
        .select()
        .from(scrapedContent)
        .where(whereClause)
        .orderBy(desc(scrapedContent.scrapedAt))
        .limit(pageSize)
        .offset(offset);

      // Get total count
      const [{ total }] = await db
        .select({ total: count() })
        .from(scrapedContent)
        .where(whereClause);

      return {
        content: content.map((item) => ({
          ...item,
          processingMetrics: item.processingMetrics
            ? JSON.parse(item.processingMetrics)
            : null,
          tags: item.tags ? JSON.parse(item.tags) : [],
        })),
        pagination: {
          page,
          pageSize,
          total,
          totalPages: Math.ceil(total / pageSize),
        },
      };
    }),

  // Get content by ID
  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .meta({
      description: "Get scraped content by ID",
    })
    .query(async ({ input }) => {
      const [content] = await db
        .select()
        .from(scrapedContent)
        .where(eq(scrapedContent.id, input.id));

      if (!content) {
        throw new Error("Content not found");
      }

      return {
        ...content,
        processingMetrics: content.processingMetrics
          ? JSON.parse(content.processingMetrics)
          : null,
        tags: content.tags ? JSON.parse(content.tags) : [],
      };
    }),

  // Get statistics about scraped content
  getStats: publicProcedure
    .meta({
      description: "Get statistics about scraped content",
    })
    .query(async () => {
      const stats = await db
        .select({
          source: scrapedContent.source,
          status: scrapedContent.status,
          total: count(),
        })
        .from(scrapedContent)
        .groupBy(scrapedContent.source, scrapedContent.status);

      // Aggregate by source
      const bySource: Record<
        string,
        { byStatus: Record<string, number>; total: number }
      > = {};
      let totalItems = 0;

      for (const stat of stats) {
        totalItems += stat.total;

        if (!bySource[stat.source]) {
          bySource[stat.source] = { byStatus: {}, total: 0 };
        }

        bySource[stat.source].total += stat.total;
        bySource[stat.source].byStatus[stat.status] = stat.total;
      }

      return {
        bySource,
        sources: Object.keys(bySource),
        totalItems,
      };
    }),

  // Update content status
  updateStatus: publicProcedure
    .input(
      z.object({
        id: z.string(),
        status: z.enum(["raw", "processed", "archived"]),
      })
    )
    .meta({
      description: "Update the status of scraped content",
    })
    .mutation(async ({ input }) => {
      const [updated] = await db
        .update(scrapedContent)
        .set({ status: input.status, updatedAt: new Date() })
        .where(eq(scrapedContent.id, input.id))
        .returning();

      if (!updated) {
        throw new Error("Content not found");
      }

      return {
        content: {
          ...updated,
          processingMetrics: updated.processingMetrics
            ? JSON.parse(updated.processingMetrics)
            : null,
          tags: updated.tags ? JSON.parse(updated.tags) : [],
        },
        success: true,
      };
    }),
});
