"use client";

import {
  ArrowLeft,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  Shuffle,
  Repeat,
  Download,
  Share2,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { ThemeSwitcher, Slider } from "@/components/ui";

interface PlayerLayoutProps {
  children: React.ReactNode;
  episode?: {
    id: string;
    title: string;
    summary: string;
    audioUrl?: string;
    duration?: number;
    source: string;
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
    <div className="min-h-screen bg-base-100 flex flex-col">
      {/* Header */}
      <header className="navbar bg-base-100 shadow-sm border-b border-base-300">
        <div className="navbar-start">
          <Link href="/" className="btn btn-ghost btn-circle">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="ml-4">
            <h1 className="font-semibold text-lg truncate max-w-xs">
              {episode?.title || "Episode Player"}
            </h1>
            <p className="text-sm text-base-content/70">
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
              <Download className="w-5 h-5" />
            </button>
            <button
              className="btn btn-ghost btn-circle tooltip tooltip-left"
              data-tip="Share"
            >
              <Share2 className="w-5 h-5" />
            </button>
            <ThemeSwitcher />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-6">{children}</main>

      {/* Audio Player - Fixed Bottom */}
      {episode && (
        <div className="sticky bottom-0 bg-base-100 border-t border-base-300 shadow-lg">
          {/* Progress Bar */}
          <div className="w-full">
            <Slider
              value={progress}
              max={100}
              className="w-full h-2 rounded-none"
              variant="primary"
            />
          </div>

          {/* Player Controls */}
          <div className="px-4 py-3">
            <div className="flex items-center justify-between">
              {/* Time Display */}
              <div className="text-xs text-base-content/70 min-w-0 flex-shrink-0">
                {formatTime(currentTime)} / {formatTime(duration)}
              </div>

              {/* Center Controls */}
              <div className="flex items-center gap-2 mx-4">
                <button className="btn btn-ghost btn-circle btn-sm">
                  <Shuffle className="w-4 h-4" />
                </button>

                <button className="btn btn-ghost btn-circle btn-sm">
                  <SkipBack className="w-4 h-4" />
                </button>

                <button
                  className="btn btn-primary btn-circle"
                  onClick={() => setIsPlaying(!isPlaying)}
                >
                  {isPlaying ? (
                    <Pause className="w-5 h-5" />
                  ) : (
                    <Play className="w-5 h-5 ml-0.5" />
                  )}
                </button>

                <button className="btn btn-ghost btn-circle btn-sm">
                  <SkipForward className="w-4 h-4" />
                </button>

                <button className="btn btn-ghost btn-circle btn-sm">
                  <Repeat className="w-4 h-4" />
                </button>
              </div>

              {/* Right Controls */}
              <div className="flex items-center gap-2 min-w-0 flex-shrink-0">
                {/* Playback Speed */}
                <div className="dropdown dropdown-top dropdown-end">
                  <button className="btn btn-ghost btn-sm text-xs">
                    {playbackSpeed}x
                  </button>
                  <ul className="dropdown-content menu bg-base-100 rounded-box shadow-lg p-2 w-20">
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
                <div className="hidden sm:flex items-center gap-2">
                  <Volume2 className="w-4 h-4" />
                  <Slider
                    value={volume}
                    max={100}
                    className="w-20"
                    variant="accent"
                  />
                </div>
              </div>
            </div>

            {/* Episode Info (Mobile) */}
            <div className="mt-2 sm:hidden">
              <p className="text-sm font-medium truncate">{episode.title}</p>
              <p className="text-xs text-base-content/70">{episode.source}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
