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
      <div className="card bg-base-100 border border-base-300">
        <div className="card-body p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-base-content/70">
                {episode.title}
              </h3>
              <p className="text-sm text-base-content/50">
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
              <Play className="w-5 h-5" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card bg-base-100 border border-base-300 shadow-sm overflow-hidden">
      {/* Colored Header Section */}
      <div className="bg-primary/10 px-6 py-4 border-b border-primary/20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
            <div className="w-5 h-5 bg-primary rounded-sm" />
          </div>
          <div>
            <h3 className="font-semibold text-lg text-base-content">
              {episode.title}
            </h3>
            <p className="text-sm text-primary font-medium">
              {episode.source?.name || `Source ${episode.sourceId}`}
            </p>
          </div>
        </div>
      </div>

      <div className="card-body p-6">
        {/* Main Controls */}
        <div className="flex items-center gap-4 mb-4">
          <button className="btn btn-circle btn-sm">
            <SkipBack className="w-4 h-4" />
          </button>

          <button
            className="btn btn-circle btn-primary btn-lg"
            onClick={onPlayPause}
          >
            {isPlaying ? (
              <Pause className="w-6 h-6" />
            ) : (
              <Play className="w-6 h-6 ml-1" />
            )}
          </button>

          <button className="btn btn-circle btn-sm">
            <SkipForward className="w-4 h-4" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex items-center gap-3">
            <span className="text-xs text-base-content/60 w-10">
              {formatTime(currentTime)}
            </span>

            <div
              className="flex-1 h-2 bg-base-300 rounded-full cursor-pointer relative"
              onClick={handleProgressClick}
              ref={progressBarRef}
            >
              <div
                className="h-full bg-primary rounded-full transition-all duration-150"
                style={{ width: `${progress}%` }}
              />
              <div
                className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-primary rounded-full border-2 border-base-100 shadow-sm transition-all duration-150"
                style={{ left: `calc(${progress}% - 8px)` }}
              />
            </div>

            <span className="text-xs text-base-content/60 w-10">
              {formatTime(duration)}
            </span>
          </div>
        </div>

        {/* Volume Control */}
        <div className="flex items-center gap-3">
          <Volume2 className="w-4 h-4 text-base-content/60" />
          <div
            className="w-20 h-1 bg-base-300 rounded-full cursor-pointer relative"
            onClick={handleVolumeClick}
            ref={volumeBarRef}
          >
            <div
              className="h-full bg-primary/70 rounded-full"
              style={{ width: `${volume * 100}%` }}
            />
          </div>
          <span className="text-xs text-base-content/40">
            {Math.round(volume * 100)}%
          </span>
        </div>
      </div>
    </div>
  );
}
