import { ScraperManager } from "./src/lib/services/scraping/scraper-manager";

async function testDatabasePersistence() {
  console.log("🚀 Testing Database Persistence...\n");

  try {
    // Create manager with database persistence enabled
    const manager = new ScraperManager({
      deduplicationEnabled: true,
      persistToDatabase: true,
    });

    // Test just one scraper first
    console.log("📡 Testing TLDR scraper...");
    const result = await manager.scrapeSource("tldr");

    console.log(`✅ Success: ${result.success}`);
    if (result.content) {
      console.log(`📰 Items found: ${result.content.length}`);
      console.log("📋 Sample content:");
      for (const [index, item] of result.content.slice(0, 2).entries()) {
        console.log(`${index + 1}. ${item.title}`);
        console.log(`   Source: ${item.source} | Category: ${item.category}`);
        console.log(`   Hash: ${item.contentHash.slice(0, 12)}...`);
      }
    }

    console.log("\n✅ Database persistence test completed!");
  } catch (error) {
    console.error("❌ Error:", error);
  }
}

testDatabasePersistence();
