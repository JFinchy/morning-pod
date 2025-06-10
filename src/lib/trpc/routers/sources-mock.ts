import { z } from "zod";

import { getEnabledSources } from "../../feature-flags/server";
import { mockSources, type Source } from "../../mock-data/sources";
import { createTRPCRouter, publicProcedure } from "../server-mock";

// Using imported mockSources from mock-data/sources.ts

export const sourcesMockRouter = createTRPCRouter({
  // Get active sources only (with feature flag filtering)
  getActive: publicProcedure.query(async () => {
    const activeSources = mockSources.filter((source) => source.active);
    return await getEnabledSources(activeSources);
  }),

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

  // Get sources grouped by category (with feature flag filtering)
  getByCategory: publicProcedure.query(async () => {
    const activeSources = mockSources.filter((source) => source.active);
    const enabledSources = await getEnabledSources(activeSources);

    return enabledSources.reduce(
      (acc, source) => {
        if (!acc[source.category]) {
          acc[source.category] = [];
        }
        acc[source.category].push(source);
        return acc;
      },
      {} as Record<string, Source[]>
    );
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
});
