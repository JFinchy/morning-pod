"use client";

import { Play } from "lucide-react";
import { Button } from "@/components/ui";
import { useAudio } from "@/components/providers/AudioProvider";
import { type Episode } from "@/lib/db/schema";

interface ListenNowButtonProps {
  latestEpisode: Episode | null;
}

export function ListenNowButton({ latestEpisode }: ListenNowButtonProps) {
  const { playEpisode } = useAudio();

  if (!latestEpisode) return null;

  return (
    <Button
      className="gap-2 h-14 px-8 text-lg shadow-2xl"
      size="lg"
      variant="secondary"
      onClick={() => playEpisode(latestEpisode)}
    >
      <Play className="w-5 h-5" />
      Listen Now
    </Button>
  );
}
