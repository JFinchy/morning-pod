import { eq, desc, and, sql } from "drizzle-orm";
import { z } from "zod";

import { episodes, sources } from "../../db/connection";
import { createTRPCRouter, publicProcedure } from "../server";

// Input validation schemas
const createEpisodeSchema = z.object({
  sourceId: z.string().min(1),
  title: z.string().min(1).max(500),
  summary: z.string().min(1),
  contentHash: z.string().min(1),
  audioUrl: z.string().url().optional(),
  audioSize: z.number().int().positive().optional(),
  duration: z.number().int().min(0).default(0),
  generationCost: z.string().default("0"),
  ttsService: z.enum(["openai", "google"]).default("openai"),
  status: z
    .enum(["pending", "generating", "ready", "failed"])
    .default("pending"),
});

const updateEpisodeSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1).max(500).optional(),
  summary: z.string().min(1).optional(),
  audioUrl: z.string().url().optional(),
  audioSize: z.number().int().positive().optional(),
  duration: z.number().int().min(0).optional(),
  playCount: z.number().int().min(0).optional(),
  generationCost: z.string().optional(),
  status: z.enum(["pending", "generating", "ready", "failed"]).optional(),
});

const getEpisodesSchema = z.object({
  limit: z.number().int().min(1).max(100).default(10),
  offset: z.number().int().min(0).default(0),
  status: z.enum(["pending", "generating", "ready", "failed"]).optional(),
  sourceId: z.string().optional(),
});

export const episodesRouter = createTRPCRouter({
  // Get all episodes with pagination and filtering
  getAll: publicProcedure
    .input(getEpisodesSchema)
    .query(async ({ ctx, input }) => {
      const { limit, offset, status, sourceId } = input;

      const conditions = [];
      if (status) conditions.push(eq(episodes.status, status));
      if (sourceId) conditions.push(eq(episodes.sourceId, sourceId));

      const whereClause =
        conditions.length > 0 ? and(...conditions) : undefined;

      const episodeList = await ctx.db
        .select({
          episode: episodes,
          source: sources,
        })
        .from(episodes)
        .leftJoin(sources, eq(episodes.sourceId, sources.id))
        .where(whereClause)
        .orderBy(desc(episodes.createdAt))
        .limit(limit)
        .offset(offset);

      // Get total count for pagination
      const totalResult = await ctx.db
        .select({ count: sql<number>`count(*)` })
        .from(episodes)
        .where(whereClause);

      const total = totalResult[0]?.count || 0;

      return {
        episodes: episodeList.map(({ episode, source }) => ({
          ...episode,
          source: source || undefined,
        })),
        pagination: {
          total,
          limit,
          offset,
          hasMore: offset + limit < total,
        },
      };
    }),

  // Get episode by ID
  getById: publicProcedure
    .input(z.object({ id: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      const result = await ctx.db
        .select({
          episode: episodes,
          source: sources,
        })
        .from(episodes)
        .leftJoin(sources, eq(episodes.sourceId, sources.id))
        .where(eq(episodes.id, input.id))
        .limit(1);

      if (!result[0]) {
        throw new Error("Episode not found");
      }

      return {
        ...result[0].episode,
        source: result[0].source || undefined,
      };
    }),

  // Create new episode
  create: publicProcedure
    .input(createEpisodeSchema)
    .mutation(async ({ ctx, input }) => {
      const [newEpisode] = await ctx.db
        .insert(episodes)
        .values(input)
        .returning();

      return newEpisode;
    }),

  // Update episode
  update: publicProcedure
    .input(updateEpisodeSchema)
    .mutation(async ({ ctx, input }) => {
      const { id, ...updateData } = input;

      const [updatedEpisode] = await ctx.db
        .update(episodes)
        .set({
          ...updateData,
          updatedAt: new Date(),
        })
        .where(eq(episodes.id, id))
        .returning();

      if (!updatedEpisode) {
        throw new Error("Episode not found");
      }

      return updatedEpisode;
    }),

  // Delete episode
  delete: publicProcedure
    .input(z.object({ id: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const [deletedEpisode] = await ctx.db
        .delete(episodes)
        .where(eq(episodes.id, input.id))
        .returning();

      if (!deletedEpisode) {
        throw new Error("Episode not found");
      }

      return { success: true };
    }),

  // Increment play count
  incrementPlayCount: publicProcedure
    .input(z.object({ id: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const [updatedEpisode] = await ctx.db
        .update(episodes)
        .set({
          playCount: sql`${episodes.playCount} + 1`,
          updatedAt: new Date(),
        })
        .where(eq(episodes.id, input.id))
        .returning();

      if (!updatedEpisode) {
        throw new Error("Episode not found");
      }

      return updatedEpisode;
    }),

  // Get episode statistics
  getStats: publicProcedure.query(async ({ ctx }) => {
    const stats = await ctx.db
      .select({
        total: sql<number>`count(*)`,
        ready: sql<number>`count(*) filter (where status = 'ready')`,
        generating: sql<number>`count(*) filter (where status = 'generating')`,
        pending: sql<number>`count(*) filter (where status = 'pending')`,
        failed: sql<number>`count(*) filter (where status = 'failed')`,
        totalPlays: sql<number>`sum(play_count)`,
        totalCost: sql<string>`sum(generation_cost)`,
      })
      .from(episodes);

    return (
      stats[0] || {
        total: 0,
        ready: 0,
        generating: 0,
        pending: 0,
        failed: 0,
        totalPlays: 0,
        totalCost: "0",
      }
    );
  }),
});
