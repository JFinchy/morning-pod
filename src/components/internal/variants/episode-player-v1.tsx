"use client";

import { Pause, Play, SkipBack, SkipForward, Volume2 } from "lucide-react";
import { useRef, useState } from "react";

import { type Episode } from "@/lib/mock-data/episodes";

interface EpisodePlayerV1Props {
  currentTime?: number;
  duration?: number;
  episode: Episode;
  isPlaying?: boolean;
  onPlayPause?: () => void;
  onSeek?: (time: number) => void;
  onVolumeChange?: (volume: number) => void;
  volume?: number;
}

export function EpisodePlayerV1({
  currentTime = 0,
  duration = 300, // 5 minutes default
  episode,
  isPlaying = false,
  onPlayPause,
  onSeek,
  onVolumeChange,
  volume = 0.8,
}: EpisodePlayerV1Props) {
  const progressBarRef = useRef<HTMLDivElement>(null);
  const volumeBarRef = useRef<HTMLDivElement>(null);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleProgressClick = (e: React.MouseEvent) => {
    if (!progressBarRef.current || !onSeek) return;

    const rect = progressBarRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentage = clickX / rect.width;
    const newTime = percentage * duration;

    onSeek(Math.max(0, Math.min(duration, newTime)));
  };

  const handleVolumeClick = (e: React.MouseEvent) => {
    if (!volumeBarRef.current || !onVolumeChange) return;

    const rect = volumeBarRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentage = clickX / rect.width;

    onVolumeChange(Math.max(0, Math.min(1, percentage)));
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  if (episode.status !== "ready" || !episode.audioUrl) {
    return (
      <div className="card bg-base-100 border-base-300 border">
        <div className="card-body p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base-content/70 font-medium">
                {episode.title}
              </h3>
              <p className="text-base-content/50 text-sm">
                {episode.status === "generating"
                  ? "Generating audio..."
                  : episode.status === "pending"
                    ? "Queued for generation"
                    : episode.status === "failed"
                      ? "Generation failed"
                      : "Audio not available"}
              </p>
            </div>
            <div className="btn btn-disabled btn-circle">
              <Play className="h-5 w-5" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card bg-base-100 border-base-300 overflow-hidden border shadow-sm">
      {/* Colored Header Section */}
      <div className="bg-primary/10 border-primary/20 border-b px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="bg-primary/20 flex h-10 w-10 items-center justify-center rounded-lg">
            <div className="bg-primary h-5 w-5 rounded-sm" />
          </div>
          <div>
            <h3 className="text-base-content text-lg font-semibold">
              {episode.title}
            </h3>
            <p className="text-primary text-sm font-medium">
              {episode.source?.name || `Source ${episode.sourceId}`}
            </p>
          </div>
        </div>
      </div>

      <div className="card-body p-6">
        {/* Main Controls */}
        <div className="mb-4 flex items-center gap-4">
          <button className="btn btn-circle btn-sm">
            <SkipBack className="h-4 w-4" />
          </button>

          <button
            className="btn btn-circle btn-primary btn-lg"
            onClick={onPlayPause}
          >
            {isPlaying ? (
              <Pause className="h-6 w-6" />
            ) : (
              <Play className="ml-1 h-6 w-6" />
            )}
          </button>

          <button className="btn btn-circle btn-sm">
            <SkipForward className="h-4 w-4" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex items-center gap-3">
            <span className="text-base-content/60 w-10 text-xs">
              {formatTime(currentTime)}
            </span>

            <div
              className="bg-base-300 relative h-2 flex-1 cursor-pointer rounded-full"
              onClick={handleProgressClick}
              ref={progressBarRef}
            >
              <div
                className="bg-primary h-full rounded-full transition-all duration-150"
                style={{ width: `${progress}%` }}
              />
              <div
                className="bg-primary border-base-100 absolute top-1/2 h-4 w-4 -translate-y-1/2 rounded-full border-2 shadow-sm transition-all duration-150"
                style={{ left: `calc(${progress}% - 8px)` }}
              />
            </div>

            <span className="text-base-content/60 w-10 text-xs">
              {formatTime(duration)}
            </span>
          </div>
        </div>

        {/* Volume Control */}
        <div className="flex items-center gap-3">
          <Volume2 className="text-base-content/60 h-4 w-4" />
          <div
            className="bg-base-300 relative h-1 w-20 cursor-pointer rounded-full"
            onClick={handleVolumeClick}
            ref={volumeBarRef}
          >
            <div
              className="bg-primary/70 h-full rounded-full"
              style={{ width: `${volume * 100}%` }}
            />
          </div>
          <span className="text-base-content/40 text-xs">
            {Math.round(volume * 100)}%
          </span>
        </div>
      </div>
    </div>
  );
}
