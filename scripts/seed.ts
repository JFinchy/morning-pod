#!/usr/bin/env bun
import { db, sources, episodes, queue } from "../src/lib/db/connection";

const seedSources = [
  {
    id: "tldr",
    name: "TLDR Newsletter",
    url: "https://tldr.tech",
    category: "Tech News",
    active: true,
    dailyLimit: 3,
    contentTier: "premium",
    ttsService: "openai" as const,
  },
  {
    id: "hacker-news",
    name: "Hacker News",
    url: "https://news.ycombinator.com",
    category: "Developer News",
    active: true,
    dailyLimit: 5,
    contentTier: "free",
    ttsService: "openai" as const,
  },
  {
    id: "morning-brew",
    name: "Morning Brew",
    url: "https://morningbrew.com",
    category: "Business News",
    active: true,
    dailyLimit: 2,
    contentTier: "premium",
    ttsService: "google" as const,
  },
  {
    id: "ai-digest",
    name: "AI Research Digest",
    url: "https://airesearch.com",
    category: "AI & ML",
    active: true,
    dailyLimit: 4,
    contentTier: "premium",
    ttsService: "openai" as const,
  },
  {
    id: "product-hunt",
    name: "Product Hunt",
    url: "https://producthunt.com",
    category: "Product News",
    active: true,
    dailyLimit: 3,
    contentTier: "free",
    ttsService: "openai" as const,
  },
];

const seedEpisodes = [
  {
    id: "ep-1",
    sourceId: "tldr",
    title: "TLDR Tech News - January 4th, 2024",
    summary:
      "Today's tech highlights: OpenAI announces new features for ChatGPT, Apple releases iOS 17.3 with security updates, Microsoft's AI integration reaches new milestones, and startup funding trends for Q1 2024.",
    contentHash: "abc123",
    audioUrl: "/demo-audio.mp3",
    audioSize: 2547683,
    duration: 185,
    playCount: 42,
    generationCost: "0.15",
    ttsService: "openai" as const,
    status: "ready" as const,
  },
  {
    id: "ep-2",
    sourceId: "hacker-news",
    title: "Hacker News Daily - Top Stories",
    summary:
      "The latest from the tech community: New JavaScript framework debates, breakthrough in quantum computing research, and a viral discussion about remote work productivity.",
    contentHash: "def456",
    audioUrl: "/demo-audio-2.mp3",
    audioSize: 1892456,
    duration: 142,
    playCount: 28,
    generationCost: "0.12",
    ttsService: "openai" as const,
    status: "ready" as const,
  },
  {
    id: "ep-3",
    sourceId: "morning-brew",
    title: "Morning Brew Business Brief",
    summary:
      "Market updates and business insights: Tesla's Q4 earnings surprise investors, new fintech regulations in Europe, and the rise of AI-powered trading algorithms.",
    contentHash: "ghi789",
    audioUrl: null,
    audioSize: null,
    duration: 0,
    playCount: 0,
    generationCost: "0",
    ttsService: "openai" as const,
    status: "generating" as const,
  },
];

async function seed() {
  try {
    console.log("🌱 Starting database seed...");

    // Clear existing data
    console.log("🧹 Clearing existing data...");
    await db.delete(queue);
    await db.delete(episodes);
    await db.delete(sources);

    // Insert sources
    console.log("📰 Seeding sources...");
    await db.insert(sources).values(seedSources);

    // Insert episodes
    console.log("🎧 Seeding episodes...");
    await db.insert(episodes).values(seedEpisodes);

    console.log("✅ Database seeded successfully!");
    console.log(
      `📊 Inserted ${seedSources.length} sources and ${seedEpisodes.length} episodes`
    );
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    process.exit(1);
  }
}

// Run the seed function
seed();
