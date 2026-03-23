import { db } from "../../src/lib/db";
import { episodes, scrapedContent, sources } from "../../src/lib/db/schema";
import { desc, eq } from "drizzle-orm";

async function checkLatestScrapes() {
  console.log("Checking Latest Scraped Content...\n");

  const latestScraped = await db
    .select()
    .from(scrapedContent)
    .orderBy(desc(scrapedContent.scrapedAt))
    .limit(5);

  console.log("--- Latest Scraped Content ---");
  latestScraped.forEach((item) => {
    console.log(`Title: ${item.title}`);
    console.log(`Source: ${item.source}`);
    console.log(`ScrapedAt: ${item.scrapedAt}`);
    console.log(`PublishedAt: ${item.publishedAt}`);
    console.log(`URL: ${item.url}`);
    console.log("------------------------------");
  });

  console.log("\nChecking Failed Episodes...\n");
  const failedEpisodes = await db
    .select({
      id: episodes.id,
      title: episodes.title,
      status: episodes.status,
      updatedAt: episodes.updatedAt,
      sourceUrl: sources.url,
    })
    .from(episodes)
    .leftJoin(sources, eq(episodes.sourceId, sources.id))
    .where(eq(episodes.status, "failed"))
    .orderBy(desc(episodes.updatedAt))
    .limit(5);

  console.log("--- Failed Episodes ---");
  failedEpisodes.forEach((episode) => {
    console.log(`Title: ${episode.title}`);
    console.log(`Status: ${episode.status}`);
    console.log(`UpdatedAt: ${episode.updatedAt}`);
    console.log(`Source URL: ${episode.sourceUrl}`);
    console.log("------------------------------");
  });
}

checkLatestScrapes().catch(console.error);
