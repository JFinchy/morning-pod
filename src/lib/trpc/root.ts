import { episodesRouter } from "./routers/episodes";
import { queueRouter } from "./routers/queue";
import { sourcesRouter } from "./routers/sources";
import { createTRPCRouter } from "./server";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  episodes: episodesRouter,
  sources: sourcesRouter,
  queue: queueRouter,
});

// Export type definition of API
export type AppRouter = typeof appRouter;
