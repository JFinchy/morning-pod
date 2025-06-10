import { episodesMockRouter } from "./routers/episodes-mock";
import { queueMockRouter } from "./routers/queue-mock";
import { sourcesMockRouter } from "./routers/sources-mock";
import { createTRPCRouter } from "./server-mock";

/**
 * Mock version of the main router for development without database
 */
export const appMockRouter = createTRPCRouter({
  episodes: episodesMockRouter,
  queue: queueMockRouter,
  sources: sourcesMockRouter,
});

// Export type definition of API
export type AppMockRouter = typeof appMockRouter;
