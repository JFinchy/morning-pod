import { eq, desc, and, count } from "drizzle-orm";
import { z } from "zod";

import { db, sources } from "../../db";
import { createTRPCRouter, publicProcedure } from "../server";

// Input validation schemas
const getSourcesSchema = z.object({
  limit: z.number().int().min(1).max(100).default(50),
  offset: z.number().int().min(0).default(0),
  active: z.boolean().optional().describe("Filter by active status"),
  category: z.string().optional().describe("Filter by category"),
});

const createSourceSchema = z.object({
  name: z.string().min(1).max(255),
  url: z.string().url(),
  category: z.string().min(1).max(100),
  active: z.boolean().default(true),
  dailyLimit: z.number().int().min(1).default(3),
  contentTier: z.enum(["free", "premium"]).default("free"),
  ttsService: z.enum(["openai", "google"]).default("openai"),
});

const updateSourceSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1).max(255).optional(),
  url: z.string().url().optional(),
  category: z.string().min(1).max(100).optional(),
  active: z.boolean().optional(),
  dailyLimit: z.number().int().min(1).optional(),
  contentTier: z.enum(["free", "premium"]).optional(),
  ttsService: z.enum(["openai", "google"]).optional(),
});

export const sourcesRouter = createTRPCRouter({
  // Get all sources with filtering
  getAll: publicProcedure
    .meta({
      description:
        "Retrieve all content sources with filtering and pagination support.",
    })
    .input(getSourcesSchema)
    .query(async ({ input }) => {
      const { limit, offset, active, category } = input;

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
        sources: sourcesList,
        pagination: {
          total,
          limit,
          offset,
          hasMore: offset + limit < total,
        },
      };
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

  // Get active sources
  getActive: publicProcedure
    .meta({
      description: "Get all active content sources.",
    })
    .query(async () => {
      const activeSources = await db
        .select()
        .from(sources)
        .where(eq(sources.active, true))
        .orderBy(sources.name);

      return activeSources;
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
      const grouped = allSources.reduce(
        (acc, source) => {
          if (!acc[source.category]) {
            acc[source.category] = [];
          }
          acc[source.category].push(source);
          return acc;
        },
        {} as Record<string, typeof allSources>
      );

      return grouped;
    }),

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
      } catch (error: any) {
        if (error.code === "23503") {
          // Foreign key constraint violation
          throw new Error(
            "Cannot delete source: episodes are still referencing it"
          );
        }
        throw error;
      }
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
        total: totalResult[0]?.count ?? 0,
        active: activeResult[0]?.count ?? 0,
        inactive: (totalResult[0]?.count ?? 0) - (activeResult[0]?.count ?? 0),
      };
    }),
});
