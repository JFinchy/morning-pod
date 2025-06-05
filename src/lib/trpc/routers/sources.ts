import { eq, desc } from "drizzle-orm";
import { z } from "zod";

import { sources } from "../../db/connection";
import { createTRPCRouter, publicProcedure } from "../server";

// Input validation schemas
const createSourceSchema = z.object({
  name: z.string().min(1).max(255),
  url: z.string().url(),
  category: z.string().min(1).max(100),
  active: z.boolean().default(true),
  dailyLimit: z.number().int().min(1).max(50).default(3),
  contentTier: z.enum(["free", "premium"]).default("free"),
  ttsService: z.enum(["openai", "google"]).default("openai"),
});

const updateSourceSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1).max(255).optional(),
  url: z.string().url().optional(),
  category: z.string().min(1).max(100).optional(),
  active: z.boolean().optional(),
  dailyLimit: z.number().int().min(1).max(50).optional(),
  contentTier: z.enum(["free", "premium"]).optional(),
  ttsService: z.enum(["openai", "google"]).optional(),
});

const getSourcesSchema = z.object({
  active: z.boolean().optional(),
  category: z.string().optional(),
});

export const sourcesRouter = createTRPCRouter({
  // Get all sources with optional filtering
  getAll: publicProcedure
    .input(getSourcesSchema)
    .query(async ({ ctx, input }) => {
      const { active, category } = input;

      const conditions = [];
      if (active !== undefined) conditions.push(eq(sources.active, active));
      if (category) conditions.push(eq(sources.category, category));

      const whereClause =
        conditions.length > 0
          ? conditions.reduce((acc, condition) =>
              acc ? eq(acc, condition) : condition
            )
          : undefined;

      const sourceList = await ctx.db
        .select()
        .from(sources)
        .where(whereClause)
        .orderBy(desc(sources.createdAt));

      return sourceList;
    }),

  // Get source by ID
  getById: publicProcedure
    .input(z.object({ id: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      const [source] = await ctx.db
        .select()
        .from(sources)
        .where(eq(sources.id, input.id))
        .limit(1);

      if (!source) {
        throw new Error("Source not found");
      }

      return source;
    }),

  // Get active sources only
  getActive: publicProcedure.query(async ({ ctx }) => {
    const activeSourceList = await ctx.db
      .select()
      .from(sources)
      .where(eq(sources.active, true))
      .orderBy(sources.name);

    return activeSourceList;
  }),

  // Get sources grouped by category
  getByCategory: publicProcedure.query(async ({ ctx }) => {
    const sourceList = await ctx.db
      .select()
      .from(sources)
      .where(eq(sources.active, true))
      .orderBy(sources.category, sources.name);

    // Group by category
    const grouped = sourceList.reduce(
      (acc, source) => {
        const category = source.category;
        if (!acc[category]) {
          acc[category] = [];
        }
        acc[category].push(source);
        return acc;
      },
      {} as Record<string, typeof sourceList>
    );

    return grouped;
  }),

  // Create new source
  create: publicProcedure
    .input(createSourceSchema)
    .mutation(async ({ ctx, input }) => {
      const [newSource] = await ctx.db
        .insert(sources)
        .values(input)
        .returning();

      return newSource;
    }),

  // Update source
  update: publicProcedure
    .input(updateSourceSchema)
    .mutation(async ({ ctx, input }) => {
      const { id, ...updateData } = input;

      const [updatedSource] = await ctx.db
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
    .input(z.object({ id: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      // First get the current status
      const [currentSource] = await ctx.db
        .select({ active: sources.active })
        .from(sources)
        .where(eq(sources.id, input.id))
        .limit(1);

      if (!currentSource) {
        throw new Error("Source not found");
      }

      // Toggle the active status
      const [updatedSource] = await ctx.db
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
    .input(z.object({ id: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const [deletedSource] = await ctx.db
        .delete(sources)
        .where(eq(sources.id, input.id))
        .returning();

      if (!deletedSource) {
        throw new Error("Source not found");
      }

      return { success: true };
    }),
});
