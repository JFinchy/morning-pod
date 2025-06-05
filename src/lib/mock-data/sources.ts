export interface Source {
  id: string;
  name: string;
  url: string;
  category: string;
  active: boolean;
  dailyLimit: number;
  contentTier: string;
  ttsService: "openai" | "google";
  createdAt: Date;
  updatedAt: Date;
}

export const mockSources: Source[] = [
  {
    id: "tldr",
    name: "TLDR Newsletter",
    url: "https://tldr.tech",
    category: "Tech News",
    active: true,
    dailyLimit: 3,
    contentTier: "premium",
    ttsService: "openai",
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
  },
  {
    id: "hacker-news",
    name: "Hacker News",
    url: "https://news.ycombinator.com",
    category: "Developer News",
    active: true,
    dailyLimit: 5,
    contentTier: "free",
    ttsService: "openai",
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
  },
  {
    id: "morning-brew",
    name: "Morning Brew",
    url: "https://morningbrew.com",
    category: "Business News",
    active: true,
    dailyLimit: 2,
    contentTier: "premium",
    ttsService: "google",
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
  },
  {
    id: "techcrunch",
    name: "Tech Crunch",
    url: "https://techcrunch.com",
    category: "Tech News",
    active: false,
    dailyLimit: 4,
    contentTier: "free",
    ttsService: "openai",
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
  },
];
