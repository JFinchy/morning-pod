import { count } from "drizzle-orm";

import { db } from "../../src/lib/db";
import { scrapedContent } from "../../src/lib/db/schema";
import { ScraperManager } from "../../src/lib/services/scraping/scraper-manager";

async function testScrapersWithDatabase() {
  console.log("🚀 Testing Morning Pod Scrapers with Database Persistence...");

  // Check initial database state
  const [initialCount] = await db
    .select({ count: count() })
    .from(scrapedContent);
  console.log(`📊 Initial database content count: ${initialCount.count}`);

  const manager = new ScraperManager({
    deduplicationEnabled: true,
    persistToDatabase: true, // Enable database persistence
  });

  try {
    console.log("\n📡 Running scrapers with database persistence...");
    const result = await manager.scrapeAll();

    console.log("\n📊 Scraping Results:");
    console.log(`✅ Success: ${result.success}`);
    console.log(`📰 Total Items Scraped: ${result.totalItems}`);
    console.log(`🔄 Unique Items: ${result.uniqueItems}`);
    console.log(`❌ Duplicates Removed: ${result.duplicatesRemoved}`);

    // Check database state after scraping
    const [finalCount] = await db
      .select({ count: count() })
      .from(scrapedContent);
    console.log("\n💾 Database Results:");
    console.log(`📊 Final database content count: ${finalCount.count}`);
    console.log(`➕ New items saved: ${finalCount.count - initialCount.count}`);

    // Show some sample content from database
    const sampleContent = await db
      .select({
        category: scrapedContent.category,
        id: scrapedContent.id,
        scrapedAt: scrapedContent.scrapedAt,
        source: scrapedContent.source,
        status: scrapedContent.status,
        title: scrapedContent.title,
      })
      .from(scrapedContent)
      .orderBy(scrapedContent.scrapedAt)
      .limit(5);

    console.log("\n📋 Sample Database Content:");
    for (const [index, item] of sampleContent.entries()) {
      console.log(`${index + 1}. [${item.source}] ${item.title}`);
      console.log(`   Category: ${item.category} | Status: ${item.status}`);
      console.log(`   Scraped: ${item.scrapedAt?.toISOString()}`);
      console.log("");
    }

    // Test deduplication by running again
    console.log("🔄 Testing deduplication by running scrapers again...");
    const secondResult = await manager.scrapeAll();

    const [afterSecondRun] = await db
      .select({ count: count() })
      .from(scrapedContent);
    console.log("\n🔍 Deduplication Test Results:");
    console.log(`📰 Second run items: ${secondResult.totalItems}`);
    console.log(`💾 Database count after second run: ${afterSecondRun.count}`);
    console.log(
      `✅ Deduplication working: ${afterSecondRun.count === finalCount.count ? "YES" : "NO"}`
    );
  } catch (error) {
    console.error("❌ Error during scraping:", error);
  }
}

// Run the test
testScrapersWithDatabase()
  .then(() => {
    console.log("\n✅ Test completed successfully!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Test failed:", error);
    process.exit(1);
  });
