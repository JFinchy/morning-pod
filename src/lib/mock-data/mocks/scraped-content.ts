export interface ScrapedContent {
  id: string;
  sourceId: string | null;
  title: string;
  summary: string;
  content: string;
  url: string;
  publishedAt: Date;
  source: string;
  category: string;
  tags: string | null;
  contentHash: string;
  status: "raw" | "processed" | "archived";
  scrapedAt: Date;
  processingMetrics: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export const mockScrapedContent: ScrapedContent[] = [
  {
    id: "sc-1",
    sourceId: "tldr",
    title: "OpenAI Unveils SearchGPT Prototype",
    summary:
      "OpenAI is testing SearchGPT, a temporary prototype of new search features that give you fast and timely answers with clear and relevant sources.",
    content:
      "OpenAI has officially entered the search market with SearchGPT...",
    url: "https://tldr.tech/ai/2024-07-25",
    publishedAt: new Date(),
    source: "TLDR Tech",
    category: "AI",
    tags: JSON.stringify(["AI", "OpenAI", "Search"]),
    contentHash: "hash-sc-1",
    status: "raw",
    scrapedAt: new Date(),
    processingMetrics: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "sc-2",
    sourceId: "hacker-news",
    title: "Show HN: A faster way to build AI agents",
    summary:
      "A new open-source framework for building autonomous agents with sub-second latency and support for multi-modal interactions.",
    content: "Autonomous agents are becoming increasingly complex to build...",
    url: "https://news.ycombinator.com/item?id=41000000",
    publishedAt: new Date(Date.now() - 3600000), // 1 hour ago
    source: "Hacker News",
    category: "Development",
    tags: JSON.stringify(["AI", "Agents", "Open Source"]),
    contentHash: "hash-sc-2",
    status: "raw",
    scrapedAt: new Date(),
    processingMetrics: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "sc-3",
    sourceId: "morning-brew",
    title: "Fed Keeps Rates Steady, Eyes September Cut",
    summary:
      "The Federal Reserve maintained interest rates at its latest meeting but signaled that a rate cut could be on the table for September if inflation continues to cool.",
    content:
      "Federal Reserve officials voted unanimously to keep the federal funds rate...",
    url: "https://morningbrew.com/daily/2024-07-31",
    publishedAt: new Date(Date.now() - 7200000), // 2 hours ago
    source: "Morning Brew",
    category: "Business",
    tags: JSON.stringify(["Finance", "Economy", "Fed"]),
    contentHash: "hash-sc-3",
    status: "raw",
    scrapedAt: new Date(),
    processingMetrics: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "sc-4",
    sourceId: "tldr",
    title: "The State of Web Development in 2024",
    summary:
      "An in-depth look at the shifting landscape of frontend frameworks, server-side rendering, and the rise of edge computing.",
    content: "Web development continues to evolve at a breakneck pace...",
    url: "https://tldr.tech/engineering/2024-07-28",
    publishedAt: new Date(Date.now() - 86400000), // 1 day ago
    source: "TLDR Tech",
    category: "Engineering",
    tags: JSON.stringify(["Web", "Frontend", "Trends"]),
    contentHash: "hash-sc-4",
    status: "raw",
    scrapedAt: new Date(),
    processingMetrics: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];
