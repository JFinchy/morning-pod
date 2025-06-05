export { EpisodeCardV1 } from "./episode-card-v1";
export { EpisodeCardV2 } from "./episode-card-v2";
export { EpisodeCardV3 } from "./episode-card-v3";

// Variant configuration for easy switching
export const episodeCardVariants = {
  v1: "minimal",
  v2: "visual",
  v3: "compact",
} as const;

export type EpisodeCardVariant = keyof typeof episodeCardVariants;
