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

  // Get available episodes for generation
  getAvailableForGeneration: publicProcedure.query(async () => {
    // Mock available episodes that haven't been generated yet
    const availableEpisodes = [
      {
        id: "gen-1",
        title: "AI Breakthroughs: Latest Updates from Tech Giants",
        source: "TLDR Tech",
        description:
          "OpenAI releases new features, Google launches improved search algorithms, and Microsoft announces Azure AI updates.",
        publishedAt: "2 hours ago",
        estimatedDuration: "8 minutes",
      },
      {
        id: "gen-2",
        title: "Market Watch: Tech Stocks and Crypto Updates",
        source: "Morning Brew",
        description:
          "Stock market movements, cryptocurrency trends, and investment insights from today's financial news.",
        publishedAt: "4 hours ago",
        estimatedDuration: "6 minutes",
      },
      {
        id: "gen-3",
        title: "Developer Tools: New Frameworks and Libraries",
        source: "Hacker News",
        description:
          "Latest developer tools, framework updates, and community discussions from the tech development world.",
        publishedAt: "6 hours ago",
        estimatedDuration: "10 minutes",
      },
    ];

    // Simulate sometimes having no available episodes
    const hasAvailableEpisodes = Math.random() > 0.1; // 90% chance of having episodes

    return hasAvailableEpisodes ? availableEpisodes : [];
  }),

  // Generate episode
  generate: publicProcedure
    .input(z.object({ episodeId: z.string().min(1) }))
    .mutation(async ({ input }) => {
      // Simulate generation delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Simulate occasional failures
      if (Math.random() < 0.1) {
        // 10% chance of failure
        throw new Error("Episode generation failed");
      }

      // Return mock generated episode data
      return {
        id: `ep-${Date.now()}`,
        title: "AI Breakthroughs: Latest Updates from Tech Giants",
        source: "TLDR Tech",
        status: "generating" as const,
        message: "Episode generation started successfully",
      };
    }),
});
