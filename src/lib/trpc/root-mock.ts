import { episodesMockRouter } from "./routers/episodes-mock";
import { queueMockRouter } from "./routers/queue-mock";
import { sourcesMockRouter } from "./routers/sources-mock";
import { createTRPCRouter } from "./server-mock";

/**
 * Mock version of the main router for development without database
 */
export const appMockRouter = createTRPCRouter({
  episodes: episodesMockRouter,
  sources: sourcesMockRouter,
  queue: queueMockRouter,
});

// Export type definition of API
export type AppMockRouter = typeof appMockRouter;
