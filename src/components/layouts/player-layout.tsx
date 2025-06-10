"use client";

import {
  ArrowLeft,
  Download,
  Pause,
  Play,
  Repeat,
  Share2,
  Shuffle,
  SkipBack,
  SkipForward,
  Volume2,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { Slider, ThemeSwitcher } from "@/components/ui";

interface PlayerLayoutProps {
  children: React.ReactNode;
  episode?: {
    audioUrl?: string;
    duration?: number;
    id: string;
    source: string;
    summary: string;
    title: string;
  };
}

export function PlayerLayout({ children, episode }: PlayerLayoutProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime] = useState(0);
  const [volume] = useState(75);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);

  const duration = episode?.duration || 180; // Default 3 minutes for demo
  const progress = (currentTime / duration) * 100;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const speedOptions = [0.5, 0.75, 1, 1.25, 1.5, 2];

  return (
    <div className="bg-base-100 flex min-h-screen flex-col">
      {/* Header */}
      <header className="navbar bg-base-100 border-base-300 border-b shadow-sm">
        <div className="navbar-start">
          <Link className="btn btn-ghost btn-circle" href="/">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div className="ml-4">
            <h1 className="max-w-xs truncate text-lg font-semibold">
              {episode?.title || "Episode Player"}
            </h1>
            <p className="text-base-content/70 text-sm">
              {episode?.source || "Morning Pod"}
            </p>
          </div>
        </div>

        <div className="navbar-end">
          <div className="flex items-center gap-2">
            <button
              className="btn btn-ghost btn-circle tooltip tooltip-left"
              data-tip="Download"
            >
              <Download className="h-5 w-5" />
            </button>
            <button
              className="btn btn-ghost btn-circle tooltip tooltip-left"
              data-tip="Share"
            >
              <Share2 className="h-5 w-5" />
            </button>
            <ThemeSwitcher />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto flex-1 px-4 py-6">{children}</main>

      {/* Audio Player - Fixed Bottom */}
      {episode && (
        <div className="bg-base-100 border-base-300 sticky bottom-0 border-t shadow-lg">
          {/* Progress Bar */}
          <div className="w-full">
            <Slider
              className="h-2 w-full rounded-none"
              max={100}
              value={progress}
              variant="primary"
            />
          </div>

          {/* Player Controls */}
          <div className="px-4 py-3">
            <div className="flex items-center justify-between">
              {/* Time Display */}
              <div className="text-base-content/70 min-w-0 flex-shrink-0 text-xs">
                {formatTime(currentTime)} / {formatTime(duration)}
              </div>

              {/* Center Controls */}
              <div className="mx-4 flex items-center gap-2">
                <button className="btn btn-ghost btn-circle btn-sm">
                  <Shuffle className="h-4 w-4" />
                </button>

                <button className="btn btn-ghost btn-circle btn-sm">
                  <SkipBack className="h-4 w-4" />
                </button>

                <button
                  className="btn btn-primary btn-circle"
                  onClick={() => setIsPlaying(!isPlaying)}
                >
                  {isPlaying ? (
                    <Pause className="h-5 w-5" />
                  ) : (
                    <Play className="ml-0.5 h-5 w-5" />
                  )}
                </button>

                <button className="btn btn-ghost btn-circle btn-sm">
                  <SkipForward className="h-4 w-4" />
                </button>

                <button className="btn btn-ghost btn-circle btn-sm">
                  <Repeat className="h-4 w-4" />
                </button>
              </div>

              {/* Right Controls */}
              <div className="flex min-w-0 flex-shrink-0 items-center gap-2">
                {/* Playback Speed */}
                <div className="dropdown dropdown-top dropdown-end">
                  <button className="btn btn-ghost btn-sm text-xs">
                    {playbackSpeed}x
                  </button>
                  <ul className="dropdown-content menu bg-base-100 rounded-box w-20 p-2 shadow-lg">
                    {speedOptions.map((speed) => (
                      <li key={speed}>
                        <button
                          className={`text-xs ${playbackSpeed === speed ? "active" : ""}`}
                          onClick={() => setPlaybackSpeed(speed)}
                        >
                          {speed}x
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Volume */}
                <div className="hidden items-center gap-2 sm:flex">
                  <Volume2 className="h-4 w-4" />
                  <Slider
                    className="w-20"
                    max={100}
                    value={volume}
                    variant="accent"
                  />
                </div>
              </div>
            </div>

            {/* Episode Info (Mobile) */}
            <div className="mt-2 sm:hidden">
              <p className="truncate text-sm font-medium">{episode.title}</p>
              <p className="text-base-content/70 text-xs">{episode.source}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
