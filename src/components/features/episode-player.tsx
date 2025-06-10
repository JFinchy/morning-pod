"use client";

import { Heart, Pause, Play, Repeat, Shuffle, Volume2 } from "lucide-react";
import { useRef, useState } from "react";

import { type Episode } from "@/lib/mock-data/episodes";

interface EpisodePlayerProps {
  currentTime?: number;
  duration?: number;
  episode: Episode;
  isPlaying?: boolean;
  onPlayPause?: () => void;
  onSeek?: (time: number) => void;
  onVolumeChange?: (volume: number) => void;
  variant?: "compact" | "full";
  volume?: number;
}

export function EpisodePlayer({
  currentTime = 0,
  duration = 300, // 5 minutes default
  episode,
  isPlaying = false,
  onPlayPause,
  onSeek,
  onVolumeChange,
  variant = "full",
  volume = 0.8,
}: EpisodePlayerProps) {
  const [isLiked, setIsLiked] = useState(false);
  const [isRepeat, setIsRepeat] = useState(false);
  const [isShuffle, setIsShuffle] = useState(false);
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

  // Compact variant - waveform visualization
  if (variant === "compact") {
    const waveformBars = Array.from({ length: 60 }, (_, i) => {
      const height = Math.sin(i * 0.2) * 0.4 + 0.6;
      const isActive = i < (progress / 100) * 60;
      return { height, isActive };
    });

    if (episode.status !== "ready" || !episode.audioUrl) {
      return (
        <div className="bg-base-100 border-base-300 rounded-lg border p-4">
          <div className="flex items-center gap-3">
            <div className="btn btn-circle btn-sm btn-disabled">
              <Play className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-base-content/70 truncate text-sm font-medium">
                {episode.title}
              </h3>
              <p className="text-base-content/50 text-xs">
                {episode.status === "generating"
                  ? "Generating..."
                  : "Unavailable"}
              </p>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="bg-base-100 border-base-200 overflow-hidden rounded-lg border transition-shadow hover:shadow-md">
        <div className="flex items-center justify-between p-4 pb-2">
          <div className="min-w-0 flex-1">
            <h3 className="text-base-content truncate text-sm font-semibold">
              {episode.title}
            </h3>
            <p className="text-base-content/60 text-xs">
              {episode.source?.name || `Source ${episode.sourceId}`}
            </p>
          </div>
        </div>

        {/* Waveform Visualization */}
        <div className="px-4 py-2">
          <div
            className="flex h-12 cursor-pointer items-end gap-0.5"
            onClick={handleProgressClick}
            ref={progressBarRef}
          >
            {waveformBars.map((bar, index) => (
              <div
                className={`flex-1 rounded-sm transition-colors duration-75 ${
                  bar.isActive ? "bg-primary" : "bg-base-300 hover:bg-base-400"
                }`}
                key={index}
                style={{
                  height: `${bar.height * 100}%`,
                  minHeight: "2px",
                }}
              />
            ))}
          </div>
        </div>

        {/* Compact Controls */}
        <div className="bg-base-50 flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <button
              className="btn btn-circle btn-sm btn-primary"
              onClick={onPlayPause}
            >
              {isPlaying ? (
                <Pause className="h-4 w-4" />
              ) : (
                <Play className="ml-0.5 h-4 w-4" />
              )}
            </button>
            <div className="text-base-content/60 text-xs">
              {formatTime(currentTime)} / {formatTime(duration)}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Volume2 className="text-base-content/60 h-4 w-4" />
            <div
              className="bg-base-300 relative h-1 w-16 cursor-pointer rounded-full"
              onClick={handleVolumeClick}
              ref={volumeBarRef}
            >
              <div
                className="bg-primary h-full rounded-full"
                style={{ width: `${volume * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Full variant - Spotify-inspired player
  if (episode.status !== "ready" || !episode.audioUrl) {
    return (
      <div className="from-base-200 to-base-300 rounded-xl bg-gradient-to-r p-6">
        <div className="flex items-center gap-4">
          <div className="bg-base-300 flex h-16 w-16 items-center justify-center rounded-lg">
            <Play className="text-base-content/30 h-8 w-8" />
          </div>
          <div className="flex-1">
            <h3 className="text-base-content/70 font-semibold">
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
        </div>
      </div>
    );
  }

  return (
    <div className="from-base-100 to-base-200 overflow-hidden rounded-xl bg-gradient-to-r shadow-lg">
      {/* Now Playing Header */}
      <div className="bg-primary/10 border-primary/20 border-b px-6 py-3">
        <div className="flex items-center gap-3">
          <div className="bg-primary/20 flex h-12 w-12 items-center justify-center rounded-lg">
            <div className="bg-primary h-6 w-6 rounded-sm" />
          </div>
          <div>
            <h3 className="text-base-content text-lg font-bold">
              {episode.title}
            </h3>
            <p className="text-primary text-sm font-medium">
              {episode.source?.name || `Source ${episode.sourceId}`}
            </p>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Secondary Controls */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              className={`btn btn-ghost btn-sm ${isShuffle ? "text-primary" : "text-base-content/60"}`}
              onClick={() => setIsShuffle(!isShuffle)}
            >
              <Shuffle className="h-4 w-4" />
            </button>
            <button
              className={`btn btn-ghost btn-sm ${isRepeat ? "text-primary" : "text-base-content/60"}`}
              onClick={() => setIsRepeat(!isRepeat)}
            >
              <Repeat className="h-4 w-4" />
            </button>
          </div>

          <button
            className={`btn btn-ghost btn-sm ${isLiked ? "text-error" : "text-base-content/60"}`}
            onClick={() => setIsLiked(!isLiked)}
          >
            <Heart className={`h-5 w-5 ${isLiked ? "fill-current" : ""}`} />
          </button>
        </div>

        {/* Main Play Control */}
        <div className="mb-6 flex items-center justify-center">
          <button
            className="btn btn-circle btn-primary btn-lg shadow-lg transition-transform hover:scale-105"
            onClick={onPlayPause}
          >
            {isPlaying ? (
              <Pause className="h-7 w-7" />
            ) : (
              <Play className="ml-1 h-7 w-7" />
            )}
          </button>
        </div>

        {/* Progress Section */}
        <div className="space-y-3">
          <div
            className="bg-base-300 group relative h-1 cursor-pointer rounded-full"
            onClick={handleProgressClick}
            ref={progressBarRef}
          >
            <div
              className="bg-primary h-full rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
            <div
              className="bg-primary absolute top-1/2 h-3 w-3 -translate-y-1/2 rounded-full opacity-0 shadow-lg transition-opacity group-hover:opacity-100"
              style={{ left: `calc(${progress}% - 6px)` }}
            />
          </div>

          <div className="text-base-content/60 flex justify-between text-xs">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Volume Control */}
        <div className="mt-6 flex items-center gap-3">
          <Volume2 className="text-base-content/60 h-5 w-5" />
          <div
            className="bg-base-300 group relative h-1 flex-1 cursor-pointer rounded-full"
            onClick={handleVolumeClick}
            ref={volumeBarRef}
          >
            <div
              className="bg-primary/70 h-full rounded-full"
              style={{ width: `${volume * 100}%` }}
            />
            <div
              className="bg-primary absolute top-1/2 h-3 w-3 -translate-y-1/2 rounded-full opacity-0 transition-opacity group-hover:opacity-100"
              style={{ left: `calc(${volume * 100}% - 6px)` }}
            />
          </div>
          <span className="text-base-content/50 min-w-[3ch] text-xs">
            {Math.round(volume * 100)}
          </span>
        </div>
      </div>
    </div>
  );
}
