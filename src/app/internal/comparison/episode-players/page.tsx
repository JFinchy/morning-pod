"use client";

import { useState } from "react";

import {
  EpisodePlayerV1,
  EpisodePlayerV2,
  EpisodePlayerV3,
} from "@/components/internal/variants";
import { mockEpisodes } from "@/lib/mock-data/episodes";

export default function EpisodePlayerShowcase() {
  const [selectedEpisode] = useState(mockEpisodes[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(0.7);

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (time: number) => {
    setCurrentTime(time);
  };

  const handleVolumeChange = (newVolume: number) => {
    setVolume(newVolume);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-base-content mb-2">
          Episode Player Variants
        </h1>
        <p className="text-base-content/60 max-w-2xl mx-auto">
          Compare different audio player designs for podcast episodes.
        </p>
      </div>

      {/* Player Variants */}
      <div className="space-y-8">
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-base-content">
            V1: Traditional
          </h3>
          <EpisodePlayerV1
            episode={selectedEpisode}
            isPlaying={isPlaying}
            onPlayPause={handlePlayPause}
            currentTime={currentTime}
            duration={300}
            onSeek={handleSeek}
            volume={volume}
            onVolumeChange={handleVolumeChange}
          />
        </div>

        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-base-content">
            V2: Spotify-Style
          </h3>
          <EpisodePlayerV2
            episode={selectedEpisode}
            isPlaying={isPlaying}
            onPlayPause={handlePlayPause}
            currentTime={currentTime}
            duration={300}
            onSeek={handleSeek}
            volume={volume}
            onVolumeChange={handleVolumeChange}
          />
        </div>

        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-base-content">
            V3: Minimalist
          </h3>
          <EpisodePlayerV3
            episode={selectedEpisode}
            isPlaying={isPlaying}
            onPlayPause={handlePlayPause}
            currentTime={currentTime}
            duration={300}
            onSeek={handleSeek}
            volume={volume}
            onVolumeChange={handleVolumeChange}
          />
        </div>
      </div>
    </div>
  );
}
