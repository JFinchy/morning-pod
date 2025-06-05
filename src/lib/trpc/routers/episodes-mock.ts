import { z } from "zod";

import { mockEpisodes } from "../../mock-data/episodes";
import { createTRPCRouter, publicProcedure } from "../server-mock";

// Input validation schemas
const getEpisodesSchema = z.object({
  limit: z.number().int().min(1).max(100).default(10),
  offset: z.number().int().min(0).default(0),
  status: z.enum(["pending", "generating", "ready", "failed"]).optional(),
  sourceId: z.string().optional(),
});

export const episodesMockRouter = createTRPCRouter({
  // Get all episodes with pagination and filtering
  getAll: publicProcedure.input(getEpisodesSchema).query(async ({ input }) => {
    const { limit, offset, status, sourceId } = input;

    // Filter mock data
    let filteredEpisodes = mockEpisodes;

    if (status) {
      filteredEpisodes = filteredEpisodes.filter((ep) => ep.status === status);
    }

    if (sourceId) {
      filteredEpisodes = filteredEpisodes.filter(
        (ep) => ep.sourceId === sourceId
      );
    }

    // Apply pagination
    const paginatedEpisodes = filteredEpisodes.slice(offset, offset + limit);

    return {
      episodes: paginatedEpisodes,
      pagination: {
        total: filteredEpisodes.length,
        limit,
        offset,
        hasMore: offset + limit < filteredEpisodes.length,
      },
    };
  }),

  // Get episode by ID
  getById: publicProcedure
    .input(z.object({ id: z.string().min(1) }))
    .query(async ({ input }) => {
      const episode = mockEpisodes.find((ep) => ep.id === input.id);

      if (!episode) {
        throw new Error("Episode not found");
      }

      return episode;
    }),

  // Get episode statistics
  getStats: publicProcedure.query(async () => {
    const stats = {
      total: mockEpisodes.length,
      ready: mockEpisodes.filter((ep) => ep.status === "ready").length,
      generating: mockEpisodes.filter((ep) => ep.status === "generating")
        .length,
      pending: mockEpisodes.filter((ep) => ep.status === "pending").length,
      failed: mockEpisodes.filter((ep) => ep.status === "failed").length,
      totalPlays: mockEpisodes.reduce((sum, ep) => sum + ep.playCount, 0),
      totalCost: mockEpisodes
        .reduce((sum, ep) => sum + ep.generationCost, 0)
        .toFixed(2),
    };

    return stats;
  }),
});
