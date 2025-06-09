#!/usr/bin/env bun
import { db, episodes, queue, sources } from "../../src/lib/db";

async function seed() {
  console.log("🌱 Seeding database...");

  try {
    await db.transaction(async (tx) => {
      // Clear existing data
      console.log("🧹 Clearing existing data...");
      await tx.delete(queue);
      await tx.delete(episodes);
      await tx.delete(sources);

      // Insert sources
      console.log("📰 Creating sources...");
      const sourceData = [
        {
          active: true,
          category: "Technology",
          contentTier: "premium" as const,
          dailyLimit: 3,
          name: "TLDR Tech",
          ttsService: "openai" as const,
          url: "https://tldr.tech",
        },
        {
          active: true,
          category: "Technology",
          contentTier: "free" as const,
          dailyLimit: 5,
          name: "Hacker News",
          ttsService: "openai" as const,
          url: "https://news.ycombinator.com",
        },
        {
          active: true,
          category: "Business",
          contentTier: "premium" as const,
          dailyLimit: 2,
          name: "Morning Brew",
          ttsService: "google" as const,
          url: "https://morningbrew.com",
        },
        {
          active: false,
          category: "Technology",
          contentTier: "free" as const,
          dailyLimit: 3,
          name: "TechCrunch",
          ttsService: "openai" as const,
          url: "https://techcrunch.com",
        },
        {
          active: true,
          category: "Technology",
          contentTier: "free" as const,
          dailyLimit: 4,
          name: "The Verge",
          ttsService: "openai" as const,
          url: "https://theverge.com",
        },
      ];

      const insertedSources = await tx
        .insert(sources)
        .values(sourceData)
        .returning();
      console.log(`✅ Created ${insertedSources.length} sources`);

      // Insert sample episodes
      console.log("🎧 Creating sample episodes...");
      const episodeData = [
        {
          audioSize: null,
          audioUrl: null,
          contentHash: "hash_ai_breakthroughs_2024_01",
          duration: 0,
          generationCost: "0.25",
          playCount: 15,
          sourceId: insertedSources[0].id, // TLDR Tech
          status: "ready" as const,
          summary:
            "OpenAI has announced significant improvements to their language models with GPT-5, featuring enhanced reasoning capabilities, better code generation, and improved multimodal understanding. The new model shows remarkable performance in complex problem-solving tasks and maintains better factual accuracy. Early testing reveals substantial improvements in mathematical reasoning and scientific analysis.",
          title: "AI Breakthroughs: OpenAI's Latest GPT-5 Announcement",
          ttsService: "openai" as const,
        },
        {
          audioSize: 2048576,
          audioUrl: "https://example.com/audio/dev-tools.mp3",
          contentHash: "hash_dev_tools_revolution_2024_01",
          duration: 420,
          generationCost: "0.18",
          playCount: 8,
          sourceId: insertedSources[1].id, // Hacker News
          status: "ready" as const,
          summary:
            "A new web development framework has gained significant traction in the developer community, promising to reduce boilerplate code by 80% while maintaining performance. The framework introduces innovative concepts for state management and component composition. Early adopters report dramatically improved development velocity and reduced bug rates.",
          title:
            "Developer Tools Revolution: New Framework Simplifies Web Development",
          ttsService: "openai" as const,
        },
        {
          audioSize: null,
          audioUrl: null,
          contentHash: "hash_market_update_tech_2024_01",
          duration: 0,
          generationCost: "0.22",
          playCount: 3,
          sourceId: insertedSources[2].id, // Morning Brew
          status: "generating" as const,
          summary:
            "Technology stocks experienced significant gains following announcements of major AI infrastructure investments. Leading companies reported strong quarterly earnings driven by AI product adoption. Market analysts predict continued growth in the AI sector, with particular strength in enterprise applications and cloud services.",
          title: "Market Update: Tech Stocks Surge on AI Investment News",
          ttsService: "google" as const,
        },
        {
          audioSize: null,
          audioUrl: null,
          contentHash: "hash_cybersecurity_alert_2024_01",
          duration: 0,
          generationCost: "0.00",
          playCount: 0,
          sourceId: insertedSources[0].id, // TLDR Tech
          status: "pending" as const,
          summary:
            "Security researchers have discovered a critical vulnerability affecting popular web frameworks used by millions of applications. The vulnerability allows remote code execution and has been assigned a CVSS score of 9.8. Patches are being rapidly deployed, and security teams worldwide are working to assess and mitigate potential impacts.",
          title: "Cybersecurity Alert: New Vulnerability Affects Millions",
          ttsService: "openai" as const,
        },
        {
          audioSize: null,
          audioUrl: null,
          contentHash: "hash_battery_tech_revolution_2024_01",
          duration: 0,
          generationCost: "0.00",
          playCount: 0,
          sourceId: insertedSources[4].id, // The Verge
          status: "failed" as const,
          summary:
            "A breakthrough in battery technology could revolutionize mobile devices, with new solid-state batteries offering 10x the capacity of current lithium-ion batteries. The technology promises week-long battery life for smartphones and could enable new categories of portable devices. Commercial availability is expected within 18 months.",
          title:
            "Consumer Tech: Revolutionary Battery Technology Promises Week-Long Phone Life",
          ttsService: "openai" as const,
        },
      ];

      const insertedEpisodes = await tx
        .insert(episodes)
        .values(episodeData)
        .returning();
      console.log(`✅ Created ${insertedEpisodes.length} episodes`);

      // Insert sample queue items
      console.log("⏳ Creating queue items...");
      const queueData = [
        {
          episodeId: insertedEpisodes[2].id, // Market Update (generating)
          episodeTitle: insertedEpisodes[2].title,
          estimatedTimeRemaining: 45,
          position: 0,
          progress: 75,
          sourceId: insertedEpisodes[2].sourceId,
          sourceName: "Morning Brew",
          startedAt: new Date(Date.now() - 120000), // Started 2 minutes ago
          status: "generating-audio" as const,
        },
        {
          episodeId: insertedEpisodes[3].id, // Cybersecurity Alert (pending)
          episodeTitle: insertedEpisodes[3].title,
          estimatedTimeRemaining: 180,
          position: 1,
          progress: 0,
          sourceId: insertedEpisodes[3].sourceId,
          sourceName: "TLDR Tech",
          status: "pending" as const,
        },
        {
          completedAt: new Date(Date.now() - 60000), // Failed 1 minute ago
          episodeId: insertedEpisodes[4].id, // Battery Tech (failed)
          episodeTitle: insertedEpisodes[4].title,
          errorMessage: "TTS service temporarily unavailable",
          position: 2,
          progress: 25,
          sourceId: insertedEpisodes[4].sourceId,
          sourceName: "The Verge",
          startedAt: new Date(Date.now() - 300000), // Started 5 minutes ago
          status: "failed" as const,
        },
      ];

      const insertedQueueItems = await tx
        .insert(queue)
        .values(queueData)
        .returning();
      console.log(`✅ Created ${insertedQueueItems.length} queue items`);

      console.log("🎉 Database seeded successfully!");
      console.log("\n📊 Summary:");
      console.log(`   Sources: ${insertedSources.length}`);
      console.log(`   Episodes: ${insertedEpisodes.length}`);
      console.log(`   Queue Items: ${insertedQueueItems.length}`);
      console.log("\n🔗 Database connection details:");
      console.log("   Make sure your POSTGRES_URL is set in .env.local");
      console.log("   Run migrations with: bun run db:migrate");
    });
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    process.exit(1);
  }
}

// Run the seed function
seed()
  .then(() => {
    console.log("✨ Seeding completed");
    process.exit(0);
  })
  .catch((error) => {
    console.error("💥 Seeding failed:", error);
    process.exit(1);
  });
