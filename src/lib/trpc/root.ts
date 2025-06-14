import { episodesRouter } from "./routers/episodes";
import { queueRouter } from "./routers/queue";
import { queueProcessorRouter } from "./routers/queue-processor";
import { scrapedContentRouter } from "./routers/scraped-content";
import { scrapingRouter } from "./routers/scraping";
import { sourcesRouter } from "./routers/sources";
// import { summarizationRouter } from "./routers/summarization";
// import { ttsRouter } from "./routers/tts";
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
