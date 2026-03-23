import { ScraperManager } from "../../src/lib/services/scraping/scraper-manager";

async function testDatabasePersistence() {
  console.log("🚀 Testing Database Persistence with scrapeAll...\n");

  try {
    // Create manager with database persistence enabled
    const manager = new ScraperManager({
      deduplicationEnabled: true,
      persistToDatabase: true,
      enabledSources: ["tldr"], // Test just TLDR for now
    });

    console.log("📡 Triggering scrapeAll for TLDR...");
    const result = await manager.scrapeAll();

    console.log(`✅ Success: ${result.success}`);
    console.log(`📰 Total items found: ${result.totalItems}`);
    console.log(`🆕 Unique items: ${result.uniqueItems}`);
    console.log(`👯 Duplicates removed: ${result.duplicatesRemoved}`);

    console.log("\n✅ Database persistence test completed!");
  } catch (error) {
    console.error("❌ Error:", error);
  }
}

testDatabasePersistence();
