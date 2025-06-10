export interface Source {
  active: boolean;
  category: string;
  contentTier: string;
  createdAt: Date;
  dailyLimit: number;
  id: string;
  name: string;
  ttsService: "google" | "openai";
  updatedAt: Date;
  url: string;
}

export const mockSources: Source[] = [
  {
    active: true,
    category: "Tech News",
    contentTier: "premium",
    createdAt: new Date("2024-01-01"),
    dailyLimit: 3,
    id: "tldr",
    name: "TLDR Newsletter",
    ttsService: "openai",
    updatedAt: new Date("2024-01-01"),
    url: "https://tldr.tech",
  },
  {
    active: true,
    category: "Developer News",
    contentTier: "free",
    createdAt: new Date("2024-01-01"),
    dailyLimit: 5,
    id: "hacker-news",
    name: "Hacker News",
    ttsService: "openai",
    updatedAt: new Date("2024-01-01"),
    url: "https://news.ycombinator.com",
  },
  {
    active: true,
    category: "Business News",
    contentTier: "premium",
    createdAt: new Date("2024-01-01"),
    dailyLimit: 2,
    id: "morning-brew",
    name: "Morning Brew",
    ttsService: "google",
    updatedAt: new Date("2024-01-01"),
    url: "https://morningbrew.com",
  },
  {
    active: false,
    category: "Tech News",
    contentTier: "free",
    createdAt: new Date("2024-01-01"),
    dailyLimit: 4,
    id: "techcrunch",
    name: "Tech Crunch",
    ttsService: "openai",
    updatedAt: new Date("2024-01-01"),
    url: "https://techcrunch.com",
  },
];
