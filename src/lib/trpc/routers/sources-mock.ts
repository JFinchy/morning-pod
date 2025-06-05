import { z } from "zod";

import { getEnabledSources } from "../../feature-flags/server";
import { createTRPCRouter, publicProcedure } from "../server-mock";

// Mock sources data
const mockSources = [
  {
    id: "tldr",
    name: "TLDR Newsletter",
    url: "https://tldr.tech",
    category: "Tech News",
    active: true,
    dailyLimit: 3,
    contentTier: "premium",
    ttsService: "openai" as const,
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
  },
  {
    id: "hacker-news",
    name: "Hacker News",
    url: "https://news.ycombinator.com",
    category: "Developer News",
    active: true,
    dailyLimit: 5,
    contentTier: "free",
    ttsService: "openai" as const,
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
  },
  {
    id: "morning-brew",
    name: "Morning Brew",
    url: "https://morningbrew.com",
    category: "Business News",
    active: true,
    dailyLimit: 2,
    contentTier: "premium",
    ttsService: "google" as const,
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
  },
];

export const sourcesMockRouter = createTRPCRouter({
  // Get all sources with optional filtering and feature flag filtering
  getAll: publicProcedure
    .input(
      z.object({
        active: z.boolean().optional(),
        category: z.string().optional(),
      })
    )
    .query(async ({ input }) => {
      const { active, category } = input;

      let filteredSources = mockSources;

      // Filter by feature flags first
      filteredSources = await getEnabledSources(filteredSources);

      if (active !== undefined) {
        filteredSources = filteredSources.filter(
          (source) => source.active === active
        );
      }

      if (category) {
        filteredSources = filteredSources.filter(
          (source) => source.category === category
        );
      }

      return filteredSources;
    }),

  // Get source by ID
  getById: publicProcedure
    .input(z.object({ id: z.string().min(1) }))
    .query(async ({ input }) => {
      const source = mockSources.find((s) => s.id === input.id);

      if (!source) {
        throw new Error("Source not found");
      }

      return source;
    }),

  // Get active sources only (with feature flag filtering)
  getActive: publicProcedure.query(async () => {
    const activeSources = mockSources.filter((source) => source.active);
    return await getEnabledSources(activeSources);
  }),

  // Get sources grouped by category (with feature flag filtering)
  getByCategory: publicProcedure.query(async () => {
    const activeSources = mockSources.filter((source) => source.active);
    const enabledSources = await getEnabledSources(activeSources);

    const grouped = enabledSources.reduce(
      (acc, source) => {
        const category = source.category;
        if (!acc[category]) {
          acc[category] = [];
        }
        acc[category].push(source);
        return acc;
      },
      {} as Record<string, typeof enabledSources>
    );

    return grouped;
  }),
});
