import { eq, desc, and, sql, count } from "drizzle-orm";
import { z } from "zod";

import { db, episodes, sources } from "../../db/connection";
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
  limit: z
    .number()
    .int()
    .min(1)
    .max(100)
    .default(10)
    .describe("Number of episodes to return (1-100)"),
  offset: z
    .number()
    .int()
    .min(0)
    .default(0)
    .describe("Number of episodes to skip for pagination"),
  status: z
    .enum(["pending", "generating", "ready", "failed"])
    .optional()
    .describe("Filter episodes by generation status"),
  sourceId: z.string().optional().describe("Filter episodes by source ID"),
});

export const episodesRouter = createTRPCRouter({
  // Get all episodes with pagination and filtering
  getAll: publicProcedure
    .meta({
      description:
        "Retrieve all episodes with pagination and filtering support. Returns episodes with their metadata, audio URLs, and generation status.",
    })
    .input(getEpisodesSchema)
    .query(async ({ input }) => {
      const { limit, offset, status, sourceId } = input;

      // Build where conditions
      const conditions = [];
      if (status) {
        conditions.push(eq(episodes.status, status));
      }
      if (sourceId) {
        conditions.push(eq(episodes.sourceId, sourceId));
      }

      // Get episodes with source information
      const episodesList = await db
        .select({
          id: episodes.id,
          sourceId: episodes.sourceId,
          title: episodes.title,
          summary: episodes.summary,
          contentHash: episodes.contentHash,
          audioUrl: episodes.audioUrl,
          audioSize: episodes.audioSize,
          duration: episodes.duration,
          playCount: episodes.playCount,
          generationCost: episodes.generationCost,
          ttsService: episodes.ttsService,
          status: episodes.status,
          createdAt: episodes.createdAt,
          updatedAt: episodes.updatedAt,
          sourceName: sources.name,
          sourceCategory: sources.category,
        })
        .from(episodes)
        .innerJoin(sources, eq(episodes.sourceId, sources.id))
        .where(conditions.length > 0 ? and(...conditions) : undefined)
        .orderBy(desc(episodes.createdAt))
        .limit(limit)
        .offset(offset);

      // Get total count for pagination
      const [totalResult] = await db
        .select({ count: count() })
        .from(episodes)
        .where(conditions.length > 0 ? and(...conditions) : undefined);

      const total = totalResult?.count ?? 0;

      return {
        episodes: episodesList,
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
    .meta({
      description:
        "Fetch a specific episode by its unique ID. Returns detailed episode information including audio data and metadata.",
    })
    .input(
      z.object({
        id: z.string().min(1).describe("Unique episode identifier"),
      })
    )
    .query(async ({ input }) => {
      const [episode] = await db
        .select({
          id: episodes.id,
          sourceId: episodes.sourceId,
          title: episodes.title,
          summary: episodes.summary,
          contentHash: episodes.contentHash,
          audioUrl: episodes.audioUrl,
          audioSize: episodes.audioSize,
          duration: episodes.duration,
          playCount: episodes.playCount,
          generationCost: episodes.generationCost,
          ttsService: episodes.ttsService,
          status: episodes.status,
          createdAt: episodes.createdAt,
          updatedAt: episodes.updatedAt,
          sourceName: sources.name,
          sourceCategory: sources.category,
          sourceUrl: sources.url,
        })
        .from(episodes)
        .innerJoin(sources, eq(episodes.sourceId, sources.id))
        .where(eq(episodes.id, input.id));

      if (!episode) {
        throw new Error("Episode not found");
      }

      return episode;
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
    .meta({
      description: "Increment the play count for an episode when it's played.",
    })
    .input(
      z.object({
        id: z.string().min(1).describe("Episode ID to increment play count"),
      })
    )
    .mutation(async ({ input }) => {
      const [updatedEpisode] = await db
        .update(episodes)
        .set({
          playCount: sql`${episodes.playCount} + 1`,
          updatedAt: new Date(),
        })
        .where(eq(episodes.id, input.id))
        .returning({ id: episodes.id, playCount: episodes.playCount });

      if (!updatedEpisode) {
        throw new Error("Episode not found");
      }

      return updatedEpisode;
    }),

  // Get episode statistics
  getStats: publicProcedure
    .meta({
      description:
        "Get comprehensive statistics about episodes including counts by status, total plays, and generation costs.",
    })
    .query(async () => {
      // Get counts by status in parallel
      const [
        totalResult,
        readyResult,
        generatingResult,
        pendingResult,
        failedResult,
        playsResult,
        costResult,
      ] = await Promise.all([
        db.select({ count: count() }).from(episodes),
        db
          .select({ count: count() })
          .from(episodes)
          .where(eq(episodes.status, "ready")),
        db
          .select({ count: count() })
          .from(episodes)
          .where(eq(episodes.status, "generating")),
        db
          .select({ count: count() })
          .from(episodes)
          .where(eq(episodes.status, "pending")),
        db
          .select({ count: count() })
          .from(episodes)
          .where(eq(episodes.status, "failed")),
        db.select({ total: count(), plays: episodes.playCount }).from(episodes),
        db
          .select({ total: count(), cost: episodes.generationCost })
          .from(episodes),
      ]);

      // Calculate totals
      const totalPlays = playsResult.reduce(
        (sum: number, ep: any) => sum + (ep.plays || 0),
        0
      );
      const totalCost = costResult.reduce(
        (sum: number, ep: any) => sum + Number(ep.cost || 0),
        0
      );

      return {
        total: totalResult[0]?.count ?? 0,
        ready: readyResult[0]?.count ?? 0,
        generating: generatingResult[0]?.count ?? 0,
        pending: pendingResult[0]?.count ?? 0,
        failed: failedResult[0]?.count ?? 0,
        totalPlays,
        totalCost: totalCost.toFixed(2),
      };
    }),

  // Get recent episodes
  getRecent: publicProcedure
    .meta({
      description: "Get the most recent episodes for dashboard display.",
    })
    .input(
      z.object({
        limit: z.number().int().min(1).max(20).default(5),
      })
    )
    .query(async ({ input }) => {
      const recentEpisodes = await db
        .select({
          id: episodes.id,
          title: episodes.title,
          status: episodes.status,
          createdAt: episodes.createdAt,
          sourceName: sources.name,
        })
        .from(episodes)
        .innerJoin(sources, eq(episodes.sourceId, sources.id))
        .orderBy(desc(episodes.createdAt))
        .limit(input.limit);

      return recentEpisodes;
    }),
});
