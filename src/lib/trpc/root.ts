import { episodesRouter } from "./routers/episodes";
import { queueRouter } from "./routers/queue";
import { scrapingRouter } from "./routers/scraping";
import { sourcesRouter } from "./routers/sources";
import { summarizationRouter } from "./routers/summarization";
import { ttsRouter } from "./routers/tts";
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
  scraping: scrapingRouter,
  summarization: summarizationRouter,
  tts: ttsRouter,
});

// Export type definition of API
export type AppRouter = typeof appRouter;
