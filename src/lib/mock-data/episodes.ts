export interface Episode {
  audioSize: null | number;
  audioUrl: null | string;
  contentHash: string;
  createdAt: Date;
  duration: number; // in seconds
  generationCost: string;
  id: string;
  isPlaying?: boolean;
  playCount: number;
  progress?: number; // 0-100 percentage
  source?: {
    category: string;
    name: string;
    url: string;
  };
  sourceId: string;
  status: "failed" | "generating" | "pending" | "ready";
  summary: string;
  title: string;
  ttsService: "google" | "openai";
  updatedAt: Date;
}

export const mockEpisodes: Episode[] = [
  {
    audioSize: 2547683,
    audioUrl: "/demo-audio.mp3",
    contentHash: "abc123",
    createdAt: new Date("2024-01-04T09:00:00Z"),
    duration: 185, // 3:05
    generationCost: "0.15",
    id: "ep-1",
    isPlaying: false,
    playCount: 42,
    progress: 0,
    source: {
      category: "Tech News",
      name: "TLDR Newsletter",
      url: "https://tldr.tech",
    },
    sourceId: "tldr",
    status: "ready",
    summary:
      "Today's tech highlights: OpenAI announces new features for ChatGPT, Apple releases iOS 17.3 with security updates, Microsoft's AI integration reaches new milestones, and startup funding trends for Q1 2024.",
    title: "TLDR Tech News - January 4th, 2024",
    ttsService: "openai",
    updatedAt: new Date("2024-01-04T09:15:00Z"),
  },
  {
    audioSize: 1892456,
    audioUrl: "/demo-audio-2.mp3",
    contentHash: "def456",
    createdAt: new Date("2024-01-03T18:30:00Z"),
    duration: 142, // 2:22
    generationCost: "0.12",
    id: "ep-2",
    isPlaying: true,
    playCount: 28,
    progress: 67,
    source: {
      category: "Developer News",
      name: "Hacker News",
      url: "https://news.ycombinator.com",
    },
    sourceId: "hacker-news",
    status: "ready",
    summary:
      "The latest from the tech community: New JavaScript framework debates, breakthrough in quantum computing research, and a viral discussion about remote work productivity.",
    title: "Hacker News Daily - Top Stories",
    ttsService: "openai",
    updatedAt: new Date("2024-01-03T18:45:00Z"),
  },
  {
    audioSize: null,
    audioUrl: null,
    contentHash: "ghi789",
    createdAt: new Date("2024-01-04T06:00:00Z"),
    duration: 0,
    generationCost: "0",
    id: "ep-3",
    isPlaying: false,
    playCount: 0,
    progress: 0,
    source: {
      category: "Business News",
      name: "Morning Brew",
      url: "https://morningbrew.com",
    },
    sourceId: "morning-brew",
    status: "generating",
    summary:
      "Market updates and business insights: Tesla's Q4 earnings surprise investors, new fintech regulations in Europe, and the rise of AI-powered trading algorithms.",
    title: "Morning Brew Business Brief",
    ttsService: "openai",
    updatedAt: new Date("2024-01-04T08:30:00Z"),
  },
  {
    audioSize: 3124789,
    audioUrl: "/demo-audio-3.mp3",
    contentHash: "jkl012",
    createdAt: new Date("2024-01-02T12:00:00Z"),
    duration: 234, // 3:54
    generationCost: "0.18",
    id: "ep-4",
    isPlaying: false,
    playCount: 156,
    progress: 0,
    source: {
      category: "AI & ML",
      name: "AI Research Digest",
      url: "https://airesearch.com",
    },
    sourceId: "ai-digest",
    status: "ready",
    summary:
      "Latest developments in artificial intelligence: GPT-5 rumors and speculation, breakthrough in computer vision, and ethical AI guidelines from major tech companies.",
    title: "AI Research Weekly Digest",
    ttsService: "google",
    updatedAt: new Date("2024-01-02T12:20:00Z"),
  },
  {
    audioSize: null,
    audioUrl: null,
    contentHash: "mno345",
    createdAt: new Date("2024-01-01T15:00:00Z"),
    duration: 0,
    generationCost: "0",
    id: "ep-5",
    isPlaying: false,
    playCount: 0,
    progress: 0,
    source: {
      category: "Product News",
      name: "Product Hunt",
      url: "https://producthunt.com",
    },
    sourceId: "product-hunt",
    status: "failed",
    summary:
      "Today's featured products: Revolutionary no-code platform, AI-powered design tool, and a minimalist note-taking app that's taking the productivity world by storm.",
    title: "Product Hunt Daily - Top Launches",
    ttsService: "openai",
    updatedAt: new Date("2024-01-01T15:10:00Z"),
  },
];

// Utility functions for working with episodes
export const formatDuration = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
};

export const formatFileSize = (bytes: number): string => {
  const mb = bytes / (1024 * 1024);
  return `${mb.toFixed(1)} MB`;
};

export const getStatusColor = (status: Episode["status"]): string => {
  switch (status) {
    case "ready":
      return "success";
    case "generating":
      return "warning";
    case "pending":
      return "info";
    case "failed":
      return "error";
    default:
      return "neutral";
  }
};

export const getStatusText = (status: Episode["status"]): string => {
  switch (status) {
    case "ready":
      return "Ready";
    case "generating":
      return "Generating...";
    case "pending":
      return "Pending";
    case "failed":
      return "Failed";
    default:
      return "Unknown";
  }
};
