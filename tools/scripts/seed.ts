#!/usr/bin/env bun
import { db, sources, episodes, queue } from "../../src/lib/db";

async function seed() {
  console.log("🌱 Seeding database...");

  try {
    // Clear existing data
    console.log("🧹 Clearing existing data...");
    await db.delete(queue);
    await db.delete(episodes);
    await db.delete(sources);

    // Insert sources
    console.log("📰 Creating sources...");
    const sourceData = [
      {
        name: "TLDR Tech",
        url: "https://tldr.tech",
        category: "Technology",
        active: true,
        dailyLimit: 3,
        contentTier: "premium" as const,
        ttsService: "openai" as const,
      },
      {
        name: "Hacker News",
        url: "https://news.ycombinator.com",
        category: "Technology",
        active: true,
        dailyLimit: 5,
        contentTier: "free" as const,
        ttsService: "openai" as const,
      },
      {
        name: "Morning Brew",
        url: "https://morningbrew.com",
        category: "Business",
        active: true,
        dailyLimit: 2,
        contentTier: "premium" as const,
        ttsService: "google" as const,
      },
      {
        name: "TechCrunch",
        url: "https://techcrunch.com",
        category: "Technology",
        active: false,
        dailyLimit: 3,
        contentTier: "free" as const,
        ttsService: "openai" as const,
      },
      {
        name: "The Verge",
        url: "https://theverge.com",
        category: "Technology",
        active: true,
        dailyLimit: 4,
        contentTier: "free" as const,
        ttsService: "openai" as const,
      },
    ];

    const insertedSources = await db
      .insert(sources)
      .values(sourceData)
      .returning();
    console.log(`✅ Created ${insertedSources.length} sources`);

    // Insert sample episodes
    console.log("🎧 Creating sample episodes...");
    const episodeData = [
      {
        sourceId: insertedSources[0].id, // TLDR Tech
        title: "AI Breakthroughs: OpenAI's Latest GPT-5 Announcement",
        summary:
          "OpenAI has announced significant improvements to their language models with GPT-5, featuring enhanced reasoning capabilities, better code generation, and improved multimodal understanding. The new model shows remarkable performance in complex problem-solving tasks and maintains better factual accuracy. Early testing reveals substantial improvements in mathematical reasoning and scientific analysis.",
        contentHash: "hash_ai_breakthroughs_2024_01",
        audioUrl: null,
        audioSize: null,
        duration: 0,
        playCount: 15,
        generationCost: "0.25",
        ttsService: "openai" as const,
        status: "ready" as const,
      },
      {
        sourceId: insertedSources[1].id, // Hacker News
        title:
          "Developer Tools Revolution: New Framework Simplifies Web Development",
        summary:
          "A new web development framework has gained significant traction in the developer community, promising to reduce boilerplate code by 80% while maintaining performance. The framework introduces innovative concepts for state management and component composition. Early adopters report dramatically improved development velocity and reduced bug rates.",
        contentHash: "hash_dev_tools_revolution_2024_01",
        audioUrl: "https://example.com/audio/dev-tools.mp3",
        audioSize: 2048576,
        duration: 420,
        playCount: 8,
        generationCost: "0.18",
        ttsService: "openai" as const,
        status: "ready" as const,
      },
      {
        sourceId: insertedSources[2].id, // Morning Brew
        title: "Market Update: Tech Stocks Surge on AI Investment News",
        summary:
          "Technology stocks experienced significant gains following announcements of major AI infrastructure investments. Leading companies reported strong quarterly earnings driven by AI product adoption. Market analysts predict continued growth in the AI sector, with particular strength in enterprise applications and cloud services.",
        contentHash: "hash_market_update_tech_2024_01",
        audioUrl: null,
        audioSize: null,
        duration: 0,
        playCount: 3,
        generationCost: "0.22",
        ttsService: "google" as const,
        status: "generating" as const,
      },
      {
        sourceId: insertedSources[0].id, // TLDR Tech
        title: "Cybersecurity Alert: New Vulnerability Affects Millions",
        summary:
          "Security researchers have discovered a critical vulnerability affecting popular web frameworks used by millions of applications. The vulnerability allows remote code execution and has been assigned a CVSS score of 9.8. Patches are being rapidly deployed, and security teams worldwide are working to assess and mitigate potential impacts.",
        contentHash: "hash_cybersecurity_alert_2024_01",
        audioUrl: null,
        audioSize: null,
        duration: 0,
        playCount: 0,
        generationCost: "0.00",
        ttsService: "openai" as const,
        status: "pending" as const,
      },
      {
        sourceId: insertedSources[4].id, // The Verge
        title:
          "Consumer Tech: Revolutionary Battery Technology Promises Week-Long Phone Life",
        summary:
          "A breakthrough in battery technology could revolutionize mobile devices, with new solid-state batteries offering 10x the capacity of current lithium-ion batteries. The technology promises week-long battery life for smartphones and could enable new categories of portable devices. Commercial availability is expected within 18 months.",
        contentHash: "hash_battery_tech_revolution_2024_01",
        audioUrl: null,
        audioSize: null,
        duration: 0,
        playCount: 0,
        generationCost: "0.00",
        ttsService: "openai" as const,
        status: "failed" as const,
      },
    ];

    const insertedEpisodes = await db
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
        sourceId: insertedEpisodes[2].sourceId,
        sourceName: "Morning Brew",
        status: "generating-audio" as const,
        progress: 75,
        estimatedTimeRemaining: 45,
        position: 0,
        startedAt: new Date(Date.now() - 120000), // Started 2 minutes ago
      },
      {
        episodeId: insertedEpisodes[3].id, // Cybersecurity Alert (pending)
        episodeTitle: insertedEpisodes[3].title,
        sourceId: insertedEpisodes[3].sourceId,
        sourceName: "TLDR Tech",
        status: "pending" as const,
        progress: 0,
        estimatedTimeRemaining: 180,
        position: 1,
      },
      {
        episodeId: insertedEpisodes[4].id, // Battery Tech (failed)
        episodeTitle: insertedEpisodes[4].title,
        sourceId: insertedEpisodes[4].sourceId,
        sourceName: "The Verge",
        status: "failed" as const,
        progress: 25,
        errorMessage: "TTS service temporarily unavailable",
        position: 2,
        startedAt: new Date(Date.now() - 300000), // Started 5 minutes ago
        completedAt: new Date(Date.now() - 60000), // Failed 1 minute ago
      },
    ];

    const insertedQueueItems = await db
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
