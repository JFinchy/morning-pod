"use client";

import { type Episode } from "@/lib/mock-data/episodes";
import { type GenerationStats } from "@/lib/mock-data/queue";

interface HomeClientWrapperProps {
  children?: React.ReactNode;
  initialEpisodes?: Episode[];
  initialStats?: GenerationStats | null;
}

export function HomeClientWrapper({
  children,
  initialEpisodes: _initialEpisodes,
  initialStats: _initialStats,
}: HomeClientWrapperProps) {
  // This component can be used for any client-side interactivity
  // that needs to be hydrated with server data

  // For now, it's just a placeholder for future interactive features
  // like real-time updates, notifications, etc.

  return children;
}
