"use client";

import {
  Music,
  Pause,
  Play,
  RotateCcw,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";
import React from "react";

import { Button } from "@/components/ui";
import { useAudio } from "../providers/AudioProvider";

export function GlobalAudioPlayer() {
  const {
    currentEpisode,
    isPlaying,
    currentTime,
    duration,
    volume,
    playbackRate,
    isMuted,
    togglePlayPause,
    stopEpisode,
    seek,
    setVolume,
    setPlaybackRate,
    toggleMute,
  } = useAudio();

  if (!currentEpisode) return null;

  const formatTime = (seconds: number) => {
    if (isNaN(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentage = clickX / rect.width;
    seek(percentage * duration);
  };

  const handleVolumeChange = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentage = Math.max(0, Math.min(1, clickX / rect.width));
    setVolume(percentage);
  };

  const skipTime = (seconds: number) => {
    seek(Math.max(0, Math.min(duration, currentTime + seconds)));
  };

  const changePlaybackRate = () => {
    const rates = [0.5, 0.75, 1, 1.25, 1.5, 2];
    const currentIndex = rates.indexOf(playbackRate);
    const nextRate = rates[(currentIndex + 1) % rates.length];
    setPlaybackRate(nextRate);
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-base-100/80 backdrop-blur-md border-t border-base-300 shadow-2xl safe-bottom">
      <div className="container mx-auto px-4 py-3">
        <div className="flex flex-col md:flex-row items-center gap-4">
          {/* Episode Info */}
          <div className="flex items-center gap-3 min-w-0 md:w-1/4">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
              <Music className="w-5 h-5 text-primary" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold truncate text-base-content">
                {currentEpisode.title}
              </p>
              <p className="text-xs text-base-content/60 truncate">
                {currentEpisode.sourceId}
              </p>
            </div>
          </div>

          {/* Controls & Progress */}
          <div className="flex-1 w-full max-w-2xl">
            <div className="flex items-center justify-center gap-4 mb-1">
              <Button btnStyle="ghost" onClick={() => skipTime(-10)} size="sm">
                <SkipBack className="w-4 h-4" />
              </Button>

              <Button
                className="btn-circle btn-sm shadow-md"
                onClick={togglePlayPause}
                variant="primary"
              >
                {isPlaying ? (
                  <Pause className="w-4 h-4" />
                ) : (
                  <Play className="w-4 h-4 ml-0.5" />
                )}
              </Button>

              <Button btnStyle="ghost" onClick={() => skipTime(10)} size="sm">
                <SkipForward className="w-4 h-4" />
              </Button>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-[10px] tabular-nums text-base-content/50 w-8 text-right">
                {formatTime(currentTime)}
              </span>
              <div
                className="flex-1 h-1.5 bg-base-300 rounded-full cursor-pointer relative group"
                onClick={handleSeek}
              >
                <div
                  className="h-full bg-primary rounded-full transition-all duration-100"
                  style={{ width: `${progress}%` }}
                />
                <div
                  className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-primary rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-sm border border-white"
                  style={{ left: `calc(${progress}% - 6px)` }}
                />
              </div>
              <span className="text-[10px] tabular-nums text-base-content/50 w-8">
                {formatTime(duration)}
              </span>
            </div>
          </div>

          {/* Secondary Controls */}
          <div className="hidden md:flex items-center justify-end gap-4 w-1/4">
            <Button
              btnStyle="ghost"
              className="text-[10px] font-mono h-8 min-h-0 px-2"
              onClick={changePlaybackRate}
              size="sm"
            >
              {playbackRate}x
            </Button>

            <div className="flex items-center gap-2 group w-24">
              <button onClick={toggleMute}>
                {isMuted || volume === 0 ? (
                  <VolumeX className="w-4 h-4 text-base-content/60" />
                ) : (
                  <Volume2 className="w-4 h-4 text-base-content/60" />
                )}
              </button>
              <div
                className="flex-1 h-1 bg-base-300 rounded-full cursor-pointer relative"
                onClick={handleVolumeChange}
              >
                <div
                  className="h-full bg-primary/60 rounded-full"
                  style={{ width: `${isMuted ? 0 : volume * 100}%` }}
                />
              </div>
            </div>

            <Button
              btnStyle="ghost"
              className="h-8 w-8 p-0 rounded-full"
              onClick={stopEpisode}
              size="sm"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
