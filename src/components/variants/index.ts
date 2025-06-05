export { EpisodeCardV1 } from "./episode-card-v1";
export { EpisodeCardV2 } from "./episode-card-v2";
export { EpisodeCardV3 } from "./episode-card-v3";

// Episode Player Variants
export { EpisodePlayerV1 } from "./episode-player-v1";
export { EpisodePlayerV2 } from "./episode-player-v2";
export { EpisodePlayerV3 } from "./episode-player-v3";

// Queue Status Variants
export { QueueStatusV1 } from "./queue-status-v1";
export { QueueStatusV2 } from "./queue-status-v2";
export { QueueStatusV3 } from "./queue-status-v3";

// Variant configuration for easy switching
export const episodeCardVariants = {
  v1: "minimal",
  v2: "visual",
  v3: "compact",
} as const;

export type EpisodeCardVariant = keyof typeof episodeCardVariants;
