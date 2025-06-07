import { eq, desc, and, count, sql } from "drizzle-orm";
import { z } from "zod";

import { db } from "@/lib/db";
import { scrapedContent, type NewScrapedContent } from "@/lib/db/schema";

import { createTRPCRouter, publicProcedure } from "../server";

export const scrapedContentRouter = createTRPCRouter({
  // Save scraped content to database
  create: publicProcedure
    .input(
      z.object({
        title: z.string().min(1).max(1000),
        summary: z.string().min(1),
        content: z.string().min(1),
        url: z.string().url(),
        publishedAt: z.date(),
        source: z.string().min(1).max(255),
        category: z.string().min(1).max(100),
        tags: z.array(z.string()).optional(),
        contentHash: z.string().min(1).max(128),
        sourceId: z.string().optional(),
        processingMetrics: z.record(z.any()).optional(),
      })
    )
    .meta({
      description: "Save scraped content to the database",
    })
    .mutation(async ({ input }) => {
      const newContent: NewScrapedContent = {
        ...input,
        tags: input.tags ? JSON.stringify(input.tags) : null,
        processingMetrics: input.processingMetrics
          ? JSON.stringify(input.processingMetrics)
          : null,
      };

      const [created] = await db
        .insert(scrapedContent)
        .values(newContent)
        .returning();

      return {
        success: true,
        content: {
          ...created,
          tags: created.tags ? JSON.parse(created.tags) : [],
          processingMetrics: created.processingMetrics
            ? JSON.parse(created.processingMetrics)
            : null,
        },
      };
    }),

  // Batch save multiple scraped content items
  createBatch: publicProcedure
    .input(
      z.array(
        z.object({
          title: z.string().min(1).max(1000),
          summary: z.string().min(1),
          content: z.string().min(1),
          url: z.string().url(),
          publishedAt: z.date(),
          source: z.string().min(1).max(255),
          category: z.string().min(1).max(100),
          tags: z.array(z.string()).optional(),
          contentHash: z.string().min(1).max(128),
          sourceId: z.string().optional(),
          processingMetrics: z.record(z.any()).optional(),
        })
      )
    )
    .meta({
      description: "Save multiple scraped content items to the database",
    })
    .mutation(async ({ input }) => {
      const newContentItems: NewScrapedContent[] = input.map((item) => ({
        ...item,
        tags: item.tags ? JSON.stringify(item.tags) : null,
        processingMetrics: item.processingMetrics
          ? JSON.stringify(item.processingMetrics)
          : null,
      }));

      const created = await db
        .insert(scrapedContent)
        .values(newContentItems)
        .returning();

      return {
        success: true,
        count: created.length,
        content: created.map((item) => ({
          ...item,
          tags: item.tags ? JSON.parse(item.tags) : [],
          processingMetrics: item.processingMetrics
            ? JSON.parse(item.processingMetrics)
            : null,
        })),
      };
    }),

  // Get all scraped content with pagination
  getAll: publicProcedure
    .input(
      z.object({
        page: z.number().int().positive().default(1),
        pageSize: z.number().int().positive().max(100).default(20),
        source: z.string().optional(),
        category: z.string().optional(),
        status: z.enum(["raw", "processed", "archived"]).optional(),
      })
    )
    .meta({
      description:
        "Get all scraped content with optional filtering and pagination",
    })
    .query(async ({ input }) => {
      const { page, pageSize, source, category, status } = input;
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
          tags: item.tags ? JSON.parse(item.tags) : [],
          processingMetrics: item.processingMetrics
            ? JSON.parse(item.processingMetrics)
            : null,
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
        tags: content.tags ? JSON.parse(content.tags) : [],
        processingMetrics: content.processingMetrics
          ? JSON.parse(content.processingMetrics)
          : null,
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

  // Get statistics about scraped content
  getStats: publicProcedure
    .meta({
      description: "Get statistics about scraped content",
    })
    .query(async () => {
      const stats = await db
        .select({
          total: count(),
          source: scrapedContent.source,
          status: scrapedContent.status,
        })
        .from(scrapedContent)
        .groupBy(scrapedContent.source, scrapedContent.status);

      // Aggregate by source
      const bySource: Record<
        string,
        { total: number; byStatus: Record<string, number> }
      > = {};
      let totalItems = 0;

      for (const stat of stats) {
        totalItems += stat.total;

        if (!bySource[stat.source]) {
          bySource[stat.source] = { total: 0, byStatus: {} };
        }

        bySource[stat.source].total += stat.total;
        bySource[stat.source].byStatus[stat.status] = stat.total;
      }

      return {
        totalItems,
        bySource,
        sources: Object.keys(bySource),
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
        success: true,
        content: {
          ...updated,
          tags: updated.tags ? JSON.parse(updated.tags) : [],
          processingMetrics: updated.processingMetrics
            ? JSON.parse(updated.processingMetrics)
            : null,
        },
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
        success: true,
        deletedId: deleted.id,
      };
    }),

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
        success: true,
        deletedCount: deleted.length,
        deletedIds: deleted.map((item) => item.id),
      };
    }),
});
