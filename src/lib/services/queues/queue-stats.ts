import {
  mockGenerationStats,
  type GenerationStats,
} from "@/lib/mock-data/mocks";

// Placeholder for real queue stats
export async function getQueueStats(): Promise<GenerationStats> {
  console.warn("Using mock queue stats. Implement real queue stats fetching.");
  return mockGenerationStats;
}
