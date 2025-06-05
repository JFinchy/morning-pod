"use client";

import { Play, Pause, Volume2, Shuffle, Repeat, Heart } from "lucide-react";
import { useState, useRef } from "react";

import { Episode } from "@/lib/mock-data/episodes";

interface EpisodePlayerProps {
  episode: Episode;
  isPlaying?: boolean;
  onPlayPause?: () => void;
  currentTime?: number;
  duration?: number;
  onSeek?: (time: number) => void;
  volume?: number;
  onVolumeChange?: (volume: number) => void;
}

export function EpisodePlayer({
  episode,
  isPlaying = false,
  onPlayPause,
  currentTime = 0,
  duration = 300, // 5 minutes default
  onSeek,
  volume = 0.8,
  onVolumeChange,
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

  if (episode.status !== "ready" || !episode.audioUrl) {
    return (
      <div className="bg-gradient-to-r from-base-200 to-base-300 rounded-xl p-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-base-300 rounded-lg flex items-center justify-center">
            <Play className="w-8 h-8 text-base-content/30" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-base-content/70">
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
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-base-100 to-base-200 rounded-xl overflow-hidden shadow-lg">
      {/* Now Playing Header */}
      <div className="bg-primary/10 px-6 py-3 border-b border-primary/20">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center">
            <div className="w-6 h-6 bg-primary rounded-sm"></div>
          </div>
          <div>
            <h3 className="font-bold text-lg text-base-content">
              {episode.title}
            </h3>
            <p className="text-sm text-primary font-medium">
              {episode.source.name}
            </p>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Secondary Controls */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <button
              className={`btn btn-ghost btn-sm ${isShuffle ? "text-primary" : "text-base-content/60"}`}
              onClick={() => setIsShuffle(!isShuffle)}
            >
              <Shuffle className="w-4 h-4" />
            </button>
            <button
              className={`btn btn-ghost btn-sm ${isRepeat ? "text-primary" : "text-base-content/60"}`}
              onClick={() => setIsRepeat(!isRepeat)}
            >
              <Repeat className="w-4 h-4" />
            </button>
          </div>

          <button
            className={`btn btn-ghost btn-sm ${isLiked ? "text-error" : "text-base-content/60"}`}
            onClick={() => setIsLiked(!isLiked)}
          >
            <Heart className={`w-5 h-5 ${isLiked ? "fill-current" : ""}`} />
          </button>
        </div>

        {/* Main Play Control */}
        <div className="flex items-center justify-center mb-6">
          <button
            className="btn btn-circle btn-primary btn-lg shadow-lg hover:scale-105 transition-transform"
            onClick={onPlayPause}
          >
            {isPlaying ? (
              <Pause className="w-7 h-7" />
            ) : (
              <Play className="w-7 h-7 ml-1" />
            )}
          </button>
        </div>

        {/* Progress Section */}
        <div className="space-y-3">
          <div
            ref={progressBarRef}
            className="h-1 bg-base-300 rounded-full cursor-pointer relative group"
            onClick={handleProgressClick}
          >
            <div
              className="h-full bg-primary rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
            <div
              className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-primary rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
              style={{ left: `calc(${progress}% - 6px)` }}
            />
          </div>

          <div className="flex justify-between text-xs text-base-content/60">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Volume Control */}
        <div className="flex items-center gap-3 mt-6">
          <Volume2 className="w-5 h-5 text-base-content/60" />
          <div
            ref={volumeBarRef}
            className="flex-1 h-1 bg-base-300 rounded-full cursor-pointer relative group"
            onClick={handleVolumeClick}
          >
            <div
              className="h-full bg-primary/70 rounded-full"
              style={{ width: `${volume * 100}%` }}
            />
            <div
              className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-primary rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              style={{ left: `calc(${volume * 100}% - 6px)` }}
            />
          </div>
          <span className="text-xs text-base-content/50 min-w-[3ch]">
            {Math.round(volume * 100)}
          </span>
        </div>
      </div>
    </div>
  );
}
