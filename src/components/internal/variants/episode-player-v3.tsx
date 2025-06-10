"use client";

import { MoreHorizontal, Pause, Play, Volume2 } from "lucide-react";
import { useRef, useState } from "react";

import { type Episode } from "@/lib/mock-data/episodes";

interface EpisodePlayerV3Props {
  currentTime?: number;
  duration?: number;
  episode: Episode;
  isPlaying?: boolean;
  onPlayPause?: () => void;
  onSeek?: (time: number) => void;
  onVolumeChange?: (volume: number) => void;
  volume?: number;
}

export function EpisodePlayerV3({
  currentTime = 0,
  duration = 300, // 5 minutes default
  episode,
  isPlaying = false,
  onPlayPause,
  onSeek,
  onVolumeChange,
  volume = 0.8,
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
    <div className="bg-base-100 border-base-200 overflow-hidden rounded-lg border transition-shadow hover:shadow-md">
      {/* Header */}
      <div className="flex items-center justify-between p-4 pb-2">
        <div className="min-w-0 flex-1">
          <h3 className="text-base-content truncate text-sm font-semibold">
            {episode.title}
          </h3>
          <p className="text-base-content/60 text-xs">
            {episode.source?.name || `Source ${episode.sourceId}`}
          </p>
        </div>
        <button className="btn btn-ghost btn-xs">
          <MoreHorizontal className="h-4 w-4" />
        </button>
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

      {/* Controls */}
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
          <div className="relative">
            <button
              className="btn btn-ghost btn-xs"
              onClick={() => setShowVolume(!showVolume)}
              onMouseEnter={() => setShowVolume(true)}
              onMouseLeave={() => setShowVolume(false)}
            >
              <Volume2 className="h-4 w-4" />
            </button>

            {showVolume && (
              <div
                className="bg-base-200 absolute right-0 bottom-full mb-2 rounded-lg p-2 shadow-lg"
                onMouseEnter={() => setShowVolume(true)}
                onMouseLeave={() => setShowVolume(false)}
              >
                <div className="flex items-center gap-2">
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
                  <span className="text-base-content/60 min-w-[2ch] text-xs">
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
