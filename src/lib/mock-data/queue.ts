export interface QueueItem {
  id: string;
  episodeId: string;
  episodeTitle: string;
  sourceId: string;
  sourceName: string;
  status:
    | "pending"
    | "scraping"
    | "summarizing"
    | "generating-audio"
    | "uploading"
    | "completed"
    | "failed";
  progress: number; // 0-100
  estimatedTimeRemaining?: number; // seconds
  startedAt?: Date;
  completedAt?: Date;
  errorMessage?: string;
  cost?: number;
  position: number; // position in queue
}

export interface GenerationStats {
  totalInQueue: number;
  currentlyProcessing: number;
  averageProcessingTime: number; // seconds
  estimatedWaitTime: number; // seconds
  successRate: number; // 0-1
  totalCostToday: number;
}

export const mockQueueItems: QueueItem[] = [
  {
    id: "queue-1",
    episodeId: "ep-1",
    episodeTitle: "TLDR Tech News - January 4th",
    sourceId: "tldr",
    sourceName: "TLDR Newsletter",
    status: "generating-audio",
    progress: 75,
    estimatedTimeRemaining: 45,
    startedAt: new Date(Date.now() - 120000), // 2 minutes ago
    position: 0,
    cost: 0.12,
  },
  {
    id: "queue-2",
    episodeId: "ep-2",
    episodeTitle: "Morning Brew Business Update",
    sourceId: "morning-brew",
    sourceName: "Morning Brew",
    status: "summarizing",
    progress: 40,
    estimatedTimeRemaining: 120,
    startedAt: new Date(Date.now() - 60000), // 1 minute ago
    position: 1,
    cost: 0.08,
  },
  {
    id: "queue-3",
    episodeId: "ep-3",
    episodeTitle: "Hacker News Top Stories",
    sourceId: "hackernews",
    sourceName: "Hacker News",
    status: "pending",
    progress: 0,
    estimatedTimeRemaining: 300,
    position: 2,
  },
  {
    id: "queue-4",
    episodeId: "ep-4",
    episodeTitle: "Tech Crunch Headlines",
    sourceId: "techcrunch",
    sourceName: "Tech Crunch",
    status: "pending",
    progress: 0,
    estimatedTimeRemaining: 450,
    position: 3,
  },
  {
    id: "queue-5",
    episodeId: "ep-5",
    episodeTitle: "Failed Generation Example",
    sourceId: "example",
    sourceName: "Example Source",
    status: "failed",
    progress: 30,
    errorMessage: "Rate limit exceeded. Will retry in 5 minutes.",
    startedAt: new Date(Date.now() - 300000), // 5 minutes ago
    position: 4,
    cost: 0.05,
  },
];

export const mockGenerationStats: GenerationStats = {
  totalInQueue: 5,
  currentlyProcessing: 2,
  averageProcessingTime: 180, // 3 minutes
  estimatedWaitTime: 600, // 10 minutes
  successRate: 0.92, // 92%
  totalCostToday: 2.47,
};

export const getStatusColor = (status: QueueItem["status"]) => {
  const colors = {
    pending: "text-base-content/60",
    scraping: "text-info",
    summarizing: "text-warning",
    "generating-audio": "text-primary",
    uploading: "text-secondary",
    completed: "text-success",
    failed: "text-error",
  };
  return colors[status];
};

export const getStatusIcon = (status: QueueItem["status"]) => {
  const icons = {
    pending: "Clock",
    scraping: "Globe",
    summarizing: "FileText",
    "generating-audio": "Mic",
    uploading: "Upload",
    completed: "CheckCircle",
    failed: "XCircle",
  };
  return icons[status];
};

export const getStatusLabel = (status: QueueItem["status"]) => {
  const labels = {
    pending: "Waiting in queue",
    scraping: "Scraping content",
    summarizing: "Creating summary",
    "generating-audio": "Generating audio",
    uploading: "Uploading files",
    completed: "Completed",
    failed: "Failed",
  };
  return labels[status];
};

export const formatTimeRemaining = (seconds: number): string => {
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) return `${Math.round(seconds / 60)}m`;
  return `${Math.round(seconds / 3600)}h`;
};
