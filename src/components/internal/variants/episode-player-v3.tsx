"use client";

import { Play, Pause, Volume2, MoreHorizontal } from "lucide-react";
import { useState, useRef } from "react";

import { Episode } from "@/lib/mock-data/episodes";

interface EpisodePlayerV3Props {
  episode: Episode;
  isPlaying?: boolean;
  onPlayPause?: () => void;
  currentTime?: number;
  duration?: number;
  onSeek?: (time: number) => void;
  volume?: number;
  onVolumeChange?: (volume: number) => void;
}

export function EpisodePlayerV3({
  episode,
  isPlaying = false,
  onPlayPause,
  currentTime = 0,
  duration = 300, // 5 minutes default
  onSeek,
  volume = 0.8,
  onVolumeChange,
}: EpisodePlayerV3Props) {
  const [showVolume, setShowVolume] = useState(false);
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

  // Generate simple waveform visualization
  const waveformBars = Array.from({ length: 60 }, (_, i) => {
    const height = Math.sin(i * 0.2) * 0.4 + 0.6; // Sine wave pattern
    const isActive = i < (progress / 100) * 60;
    return { height, isActive };
  });

  if (episode.status !== "ready" || !episode.audioUrl) {
    return (
      <div className="bg-base-100 border border-base-300 rounded-lg p-4">
        <div className="flex items-center gap-3">
          <div className="btn btn-circle btn-sm btn-disabled">
            <Play className="w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-sm text-base-content/70 truncate">
              {episode.title}
            </h3>
            <p className="text-xs text-base-content/50">
              {episode.status === "generating"
                ? "Generating..."
                : episode.status === "pending"
                  ? "Queued"
                  : episode.status === "failed"
                    ? "Failed"
                    : "Unavailable"}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-base-100 border border-base-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-center justify-between p-4 pb-2">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-sm text-base-content truncate">
            {episode.title}
          </h3>
          <p className="text-xs text-base-content/60">
            {episode.source?.name || `Source ${episode.sourceId}`}
          </p>
        </div>
        <button className="btn btn-ghost btn-xs">
          <MoreHorizontal className="w-4 h-4" />
        </button>
      </div>

      {/* Waveform Visualization */}
      <div className="px-4 py-2">
        <div
          ref={progressBarRef}
          className="flex items-end gap-0.5 h-12 cursor-pointer"
          onClick={handleProgressClick}
        >
          {waveformBars.map((bar, index) => (
            <div
              key={index}
              className={`flex-1 rounded-sm transition-colors duration-75 ${
                bar.isActive ? "bg-primary" : "bg-base-300 hover:bg-base-400"
              }`}
              style={{
                height: `${bar.height * 100}%`,
                minHeight: "2px",
              }}
            />
          ))}
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between px-4 py-3 bg-base-50">
        <div className="flex items-center gap-3">
          <button
            className="btn btn-circle btn-sm btn-primary"
            onClick={onPlayPause}
          >
            {isPlaying ? (
              <Pause className="w-4 h-4" />
            ) : (
              <Play className="w-4 h-4 ml-0.5" />
            )}
          </button>

          <div className="text-xs text-base-content/60">
            {formatTime(currentTime)} / {formatTime(duration)}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <button
              className="btn btn-ghost btn-xs"
              onClick={() => setShowVolume(!showVolume)}
              onMouseEnter={() => setShowVolume(true)}
              onMouseLeave={() => setShowVolume(false)}
            >
              <Volume2 className="w-4 h-4" />
            </button>

            {showVolume && (
              <div
                className="absolute bottom-full right-0 mb-2 bg-base-200 rounded-lg p-2 shadow-lg"
                onMouseEnter={() => setShowVolume(true)}
                onMouseLeave={() => setShowVolume(false)}
              >
                <div className="flex items-center gap-2">
                  <div
                    ref={volumeBarRef}
                    className="w-16 h-1 bg-base-300 rounded-full cursor-pointer relative"
                    onClick={handleVolumeClick}
                  >
                    <div
                      className="h-full bg-primary rounded-full"
                      style={{ width: `${volume * 100}%` }}
                    />
                  </div>
                  <span className="text-xs text-base-content/60 min-w-[2ch]">
                    {Math.round(volume * 100)}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
