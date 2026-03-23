import { episodesRouter } from "./routers/episodes";
import { episodesMockRouter } from "./routers/episodes-mock";
import { queueRouter } from "./routers/queue";
import { queueProcessorRouter } from "./routers/queue-processor";
import { scrapedContentRouter } from "./routers/scraped-content";
import { scrapingRouter } from "./routers/scraping";
import { sourcesRouter } from "./routers/sources";
import { createTRPCRouter } from "./server";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  episodes: episodesRouter,
  queue: queueRouter,
  queueProcessor: queueProcessorRouter,
  scrapedContent: scrapedContentRouter,
  scraping: scrapingRouter,
  sources: sourcesRouter,
  // summarization: summarizationRouter, // Temporarily disabled - needs refactoring to match new API
  // tts: ttsRouter, // Temporarily disabled - needs refactoring to match new API
});

// Export type definition of API
export type AppRouter = typeof appRouter;
