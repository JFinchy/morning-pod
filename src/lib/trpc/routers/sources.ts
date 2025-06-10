import { and, count, desc, eq } from "drizzle-orm";
import { z } from "zod";

import { db, sources } from "../../db";
import { createTRPCRouter, publicProcedure } from "../server";

// Input validation schemas
const getSourcesSchema = z.object({
  active: z.boolean().optional().describe("Filter by active status"),
  category: z.string().optional().describe("Filter by category"),
  limit: z.number().int().min(1).max(100).default(50),
  offset: z.number().int().min(0).default(0),
});

const createSourceSchema = z.object({
  active: z.boolean().default(true),
  category: z.string().min(1).max(100),
  contentTier: z.enum(["free", "premium"]).default("free"),
  dailyLimit: z.number().int().min(1).default(3),
  name: z.string().min(1).max(255),
  ttsService: z.enum(["openai", "google"]).default("openai"),
  url: z.string().url(),
});

const updateSourceSchema = z.object({
  active: z.boolean().optional(),
  category: z.string().min(1).max(100).optional(),
  contentTier: z.enum(["free", "premium"]).optional(),
  dailyLimit: z.number().int().min(1).optional(),
  id: z.string().min(1),
  name: z.string().min(1).max(255).optional(),
  ttsService: z.enum(["openai", "google"]).optional(),
  url: z.string().url().optional(),
});

export const sourcesRouter = createTRPCRouter({
  // Create new source
  create: publicProcedure
    .meta({
      description: "Create a new content source.",
    })
    .input(createSourceSchema)
    .mutation(async ({ input }) => {
      const [newSource] = await db.insert(sources).values(input).returning();

      return newSource;
    }),

  // Delete source
  delete: publicProcedure
    .meta({
      description:
        "Delete a source. Note: This will fail if episodes reference this source.",
    })
    .input(z.object({ id: z.string().min(1) }))
    .mutation(async ({ input }) => {
      try {
        const [deletedSource] = await db
          .delete(sources)
          .where(eq(sources.id, input.id))
          .returning();

        if (!deletedSource) {
          throw new Error("Source not found");
        }

        return { success: true };
      } catch (error: unknown) {
        const dbError = error as { code?: string };
        if (dbError.code === "23503") {
          // Foreign key constraint violation
          throw new Error(
            "Cannot delete source: episodes are still referencing it"
          );
        }
        throw error;
      }
    }),

  // Get active sources
  getActive: publicProcedure
    .meta({
      description: "Get all active content sources.",
    })
    .query(async () => {
      return await db
        .select()
        .from(sources)
        .where(eq(sources.active, true))
        .orderBy(sources.name);
    }),

  // Get all sources with filtering
  getAll: publicProcedure
    .meta({
      description:
        "Retrieve all content sources with filtering and pagination support.",
    })
    .input(getSourcesSchema)
    .query(async ({ input }) => {
      const { active, category, limit, offset } = input;

      // Build where conditions
      const conditions = [];
      if (active !== undefined) {
        conditions.push(eq(sources.active, active));
      }
      if (category) {
        conditions.push(eq(sources.category, category));
      }

      // Get sources
      const sourcesList = await db
        .select()
        .from(sources)
        .where(conditions.length > 0 ? and(...conditions) : undefined)
        .orderBy(desc(sources.createdAt))
        .limit(limit)
        .offset(offset);

      // Get total count
      const [totalResult] = await db
        .select({ count: count() })
        .from(sources)
        .where(conditions.length > 0 ? and(...conditions) : undefined);

      const total = totalResult?.count ?? 0;

      return {
        pagination: {
          hasMore: offset + limit < total,
          limit,
          offset,
          total,
        },
        sources: sourcesList,
      };
    }),

  // Get sources by category
  getByCategory: publicProcedure
    .meta({
      description: "Get sources grouped by category.",
    })
    .query(async () => {
      const allSources = await db
        .select()
        .from(sources)
        .where(eq(sources.active, true))
        .orderBy(sources.category, sources.name);

      // Group by category
      return allSources.reduce(
        (acc, source) => {
          if (!acc[source.category]) {
            acc[source.category] = [];
          }
          acc[source.category].push(source);
          return acc;
        },
        {} as Record<string, typeof allSources>
      );
    }),

  // Get source by ID
  getById: publicProcedure
    .meta({
      description: "Fetch a specific source by its unique ID.",
    })
    .input(z.object({ id: z.string().min(1) }))
    .query(async ({ input }) => {
      const [source] = await db
        .select()
        .from(sources)
        .where(eq(sources.id, input.id));

      if (!source) {
        throw new Error("Source not found");
      }

      return source;
    }),

  // Get source statistics
  getStats: publicProcedure
    .meta({
      description: "Get statistics about sources.",
    })
    .query(async () => {
      const [totalResult, activeResult] = await Promise.all([
        db.select({ count: count() }).from(sources),
        db
          .select({ count: count() })
          .from(sources)
          .where(eq(sources.active, true)),
      ]);

      return {
        active: activeResult[0]?.count ?? 0,
        inactive: (totalResult[0]?.count ?? 0) - (activeResult[0]?.count ?? 0),
        total: totalResult[0]?.count ?? 0,
      };
    }),

  // Toggle source active status
  toggleActive: publicProcedure
    .meta({
      description: "Toggle the active status of a source.",
    })
    .input(z.object({ id: z.string().min(1) }))
    .mutation(async ({ input }) => {
      // First get current status
      const [currentSource] = await db
        .select({ active: sources.active })
        .from(sources)
        .where(eq(sources.id, input.id));

      if (!currentSource) {
        throw new Error("Source not found");
      }

      // Toggle the status
      const [updatedSource] = await db
        .update(sources)
        .set({
          active: !currentSource.active,
          updatedAt: new Date(),
        })
        .where(eq(sources.id, input.id))
        .returning();

      return updatedSource;
    }),

  // Update source
  update: publicProcedure
    .meta({
      description: "Update an existing source.",
    })
    .input(updateSourceSchema)
    .mutation(async ({ input }) => {
      const { id, ...updateData } = input;

      const [updatedSource] = await db
        .update(sources)
        .set({
          ...updateData,
          updatedAt: new Date(),
        })
        .where(eq(sources.id, id))
        .returning();

      if (!updatedSource) {
        throw new Error("Source not found");
      }

      return updatedSource;
    }),
});
