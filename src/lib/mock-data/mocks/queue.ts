export interface QueueItem {
  completedAt?: Date;
  cost?: number;
  episodeId: string;
  episodeTitle: string;
  errorMessage?: string;
  estimatedTimeRemaining?: number; // seconds
  id: string;
  position: number; // position in queue
  progress: number; // 0-100
  sourceId: string;
  sourceName: string;
  startedAt?: Date;
  status:
    | "completed"
    | "failed"
    | "generating-audio"
    | "pending"
    | "scraping"
    | "summarizing"
    | "uploading";
}

export interface GenerationStats {
  averageProcessingTime: number; // seconds
  currentlyProcessing: number;
  estimatedWaitTime: number; // seconds
  successRate: number; // 0-1
  totalCostToday: number;
  totalInQueue: number;
}

export const mockQueueItems: QueueItem[] = [
  {
    cost: 0.12,
    episodeId: "ep-1",
    episodeTitle: "TLDR Tech News - January 4th",
    estimatedTimeRemaining: 45,
    id: "queue-1",
    position: 0,
    progress: 75,
    sourceId: "tldr",
    sourceName: "TLDR Newsletter",
    startedAt: new Date(Date.now() - 120000), // 2 minutes ago
    status: "generating-audio",
  },
  {
    cost: 0.08,
    episodeId: "ep-2",
    episodeTitle: "Morning Brew Business Update",
    estimatedTimeRemaining: 120,
    id: "queue-2",
    position: 1,
    progress: 40,
    sourceId: "morning-brew",
    sourceName: "Morning Brew",
    startedAt: new Date(Date.now() - 60000), // 1 minute ago
    status: "summarizing",
  },
  {
    episodeId: "ep-3",
    episodeTitle: "Hacker News Top Stories",
    estimatedTimeRemaining: 300,
    id: "queue-3",
    position: 2,
    progress: 0,
    sourceId: "hackernews",
    sourceName: "Hacker News",
    status: "pending",
  },
  {
    episodeId: "ep-4",
    episodeTitle: "Tech Crunch Headlines",
    estimatedTimeRemaining: 450,
    id: "queue-4",
    position: 3,
    progress: 0,
    sourceId: "techcrunch",
    sourceName: "Tech Crunch",
    status: "pending",
  },
  {
    cost: 0.05,
    episodeId: "ep-5",
    episodeTitle: "Failed Generation Example",
    errorMessage: "Rate limit exceeded. Will retry in 5 minutes.",
    id: "queue-5",
    position: 4,
    progress: 30,
    sourceId: "example",
    sourceName: "Example Source",
    startedAt: new Date(Date.now() - 300000), // 5 minutes ago
    status: "failed",
  },
];

export const mockGenerationStats: GenerationStats = {
  averageProcessingTime: 180, // 3 minutes
  currentlyProcessing: 2,
  estimatedWaitTime: 600, // 10 minutes
  successRate: 0.92, // 92%
  totalCostToday: 2.47,
  totalInQueue: 5,
};

export const getStatusColor = (status: QueueItem["status"]) => {
  const colors = {
    completed: "text-success",
    failed: "text-error",
    "generating-audio": "text-primary",
    pending: "text-base-content/60",
    scraping: "text-info",
    summarizing: "text-warning",
    uploading: "text-secondary",
  };
  return colors[status];
};

export const getStatusIcon = (status: QueueItem["status"]) => {
  const icons = {
    completed: "CheckCircle",
    failed: "XCircle",
    "generating-audio": "Mic",
    pending: "Clock",
    scraping: "Globe",
    summarizing: "FileText",
    uploading: "Upload",
  };
  return icons[status];
};

export const getStatusLabel = (status: QueueItem["status"]) => {
  const labels = {
    completed: "Completed",
    failed: "Failed",
    "generating-audio": "Generating audio",
    pending: "Waiting in queue",
    scraping: "Scraping content",
    summarizing: "Creating summary",
    uploading: "Uploading files",
  };
  return labels[status];
};

export const formatTimeRemaining = (seconds: number): string => {
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) return `${Math.round(seconds / 60)}m`;
  return `${Math.round(seconds / 3600)}h`;
};
