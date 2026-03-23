import { ScrapingService } from "../../src/lib/services/scraping/scraping-service";

async function testTldr() {
  const service = new ScrapingService();
  const url = "https://tldr.tech/tech/rss";
  console.log(`📡 Testing TLDR scraping from: ${url}`);

  try {
    const result = await service.scrapeUrl(url);
    console.log("✅ Success!");
    console.log(`Title: ${result.title}`);
    console.log(`Source: ${result.source}`);
    console.log(`Content length: ${result.content.length}`);
    console.log(`Preview: ${result.content.slice(0, 100)}...`);
  } catch (error) {
    console.error("❌ Failed:", error);
  }
}

testTldr();
