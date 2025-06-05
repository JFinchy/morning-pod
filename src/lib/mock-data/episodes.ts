export interface Episode {
  id: string;
  sourceId: string;
  title: string;
  summary: string;
  contentHash: string;
  audioUrl: string | null;
  audioSize: number | null;
  duration: number; // in seconds
  playCount: number;
  generationCost: number;
  ttsService: "openai" | "google";
  status: "pending" | "generating" | "ready" | "failed";
  source?: {
    name: string;
    url: string;
    category: string;
  };
  createdAt: Date;
  updatedAt: Date;
  isPlaying?: boolean;
  progress?: number; // 0-100 percentage
}

export const mockEpisodes: Episode[] = [
  {
    id: "ep-1",
    sourceId: "tldr",
    title: "TLDR Tech News - January 4th, 2024",
    summary:
      "Today's tech highlights: OpenAI announces new features for ChatGPT, Apple releases iOS 17.3 with security updates, Microsoft's AI integration reaches new milestones, and startup funding trends for Q1 2024.",
    contentHash: "abc123",
    audioUrl: "/demo-audio.mp3",
    audioSize: 2547683,
    duration: 185, // 3:05
    playCount: 42,
    generationCost: 0.15,
    ttsService: "openai",
    status: "ready",
    source: {
      name: "TLDR Newsletter",
      url: "https://tldr.tech",
      category: "Tech News",
    },
    createdAt: new Date("2024-01-04T09:00:00Z"),
    updatedAt: new Date("2024-01-04T09:15:00Z"),
    isPlaying: false,
    progress: 0,
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
    duration: 142, // 2:22
    playCount: 28,
    generationCost: 0.12,
    ttsService: "openai",
    status: "ready",
    source: {
      name: "Hacker News",
      url: "https://news.ycombinator.com",
      category: "Developer News",
    },
    createdAt: new Date("2024-01-03T18:30:00Z"),
    updatedAt: new Date("2024-01-03T18:45:00Z"),
    isPlaying: true,
    progress: 67,
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
    generationCost: 0,
    ttsService: "openai",
    status: "generating",
    source: {
      name: "Morning Brew",
      url: "https://morningbrew.com",
      category: "Business News",
    },
    createdAt: new Date("2024-01-04T06:00:00Z"),
    updatedAt: new Date("2024-01-04T08:30:00Z"),
    isPlaying: false,
    progress: 0,
  },
  {
    id: "ep-4",
    sourceId: "ai-digest",
    title: "AI Research Weekly Digest",
    summary:
      "Latest developments in artificial intelligence: GPT-5 rumors and speculation, breakthrough in computer vision, and ethical AI guidelines from major tech companies.",
    contentHash: "jkl012",
    audioUrl: "/demo-audio-3.mp3",
    audioSize: 3124789,
    duration: 234, // 3:54
    playCount: 156,
    generationCost: 0.18,
    ttsService: "google",
    status: "ready",
    source: {
      name: "AI Research Digest",
      url: "https://airesearch.com",
      category: "AI & ML",
    },
    createdAt: new Date("2024-01-02T12:00:00Z"),
    updatedAt: new Date("2024-01-02T12:20:00Z"),
    isPlaying: false,
    progress: 0,
  },
  {
    id: "ep-5",
    sourceId: "product-hunt",
    title: "Product Hunt Daily - Top Launches",
    summary:
      "Today's featured products: Revolutionary no-code platform, AI-powered design tool, and a minimalist note-taking app that's taking the productivity world by storm.",
    contentHash: "mno345",
    audioUrl: null,
    audioSize: null,
    duration: 0,
    playCount: 0,
    generationCost: 0,
    ttsService: "openai",
    status: "failed",
    source: {
      name: "Product Hunt",
      url: "https://producthunt.com",
      category: "Product News",
    },
    createdAt: new Date("2024-01-01T15:00:00Z"),
    updatedAt: new Date("2024-01-01T15:10:00Z"),
    isPlaying: false,
    progress: 0,
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
