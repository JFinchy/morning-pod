"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/trpc/client";
import { type Episode } from "@/lib/db/schema";
import { type GenerationStats } from "@/lib/mock-data/mocks/queue";

interface HomeClientWrapperProps {
  children?: React.ReactNode;
  initialEpisodes?: Episode[];
  initialStats?: GenerationStats | null;
  hasLatestStories?: boolean;
}

export function HomeClientWrapper({
  children,
  hasLatestStories = false,
}: HomeClientWrapperProps) {
  const router = useRouter();
  const scrapeAll = api.scraping.scrapeAll.useMutation({
    onSuccess: () => {
      // Refresh the server components to show the new stories
      router.refresh();
    },
  });

  useEffect(() => {
    // Proactively refresh feeds if none are showing
    if (!hasLatestStories) {
      console.log("Refreshing feeds on home mount...");
      scrapeAll.mutate();
    }
  }, [hasLatestStories]);

  return children;
}
