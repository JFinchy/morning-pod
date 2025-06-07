"use client";

import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  SkipBack,
  SkipForward,
  RotateCcw,
  Loader2,
  Music,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";

import { Button } from "@/components/ui";
import type { Episode } from "@/lib/db/schema";

interface AudioPlayerProps {
  episode: Episode;
  autoPlay?: boolean;
  onEpisodeEnd?: () => void;
  onTimeUpdate?: (currentTime: number, duration: number) => void;
  className?: string;
}

export function AudioPlayer({
  episode,
  autoPlay = false,
  onEpisodeEnd,
  onTimeUpdate,
  className = "",
}: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [playbackRate, setPlaybackRate] = useState(1);

  // Initialize audio element
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !episode.audioUrl) return;

    audio.volume = volume;
    audio.muted = isMuted;
    audio.playbackRate = playbackRate;

    const handleLoadStart = () => setIsLoading(true);
    const handleCanPlay = () => setIsLoading(false);
    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
      setIsLoading(false);
    };
    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
      onTimeUpdate?.(audio.currentTime, audio.duration);
    };
    const handleEnded = () => {
      setIsPlaying(false);
      onEpisodeEnd?.();
    };
    const handleError = () => {
      setError("Failed to load audio");
      setIsLoading(false);
      setIsPlaying(false);
    };

    audio.addEventListener("loadstart", handleLoadStart);
    audio.addEventListener("canplay", handleCanPlay);
    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("error", handleError);

    // Auto-play if requested
    if (autoPlay) {
      audio.play().catch(console.error);
      setIsPlaying(true);
    }

    return () => {
      audio.removeEventListener("loadstart", handleLoadStart);
      audio.removeEventListener("canplay", handleCanPlay);
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("error", handleError);
    };
  }, [
    episode.audioUrl,
    volume,
    isMuted,
    playbackRate,
    autoPlay,
    onTimeUpdate,
    onEpisodeEnd,
  ]);

  const formatTime = (seconds: number) => {
    if (isNaN(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const togglePlayPause = async () => {
    const audio = audioRef.current;
    if (!audio) return;

    try {
      if (isPlaying) {
        audio.pause();
        setIsPlaying(false);
      } else {
        await audio.play();
        setIsPlaying(true);
      }
    } catch (err) {
      console.error("Playback error:", err);
      setError("Playback failed");
    }
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current;
    if (!audio || !duration) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentage = clickX / rect.width;
    const newTime = percentage * duration;

    audio.currentTime = Math.max(0, Math.min(duration, newTime));
    setCurrentTime(newTime);
  };

  const handleVolumeChange = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentage = Math.max(0, Math.min(1, clickX / rect.width));

    setVolume(percentage);
    if (audioRef.current) {
      audioRef.current.volume = percentage;
    }
    setIsMuted(percentage === 0);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
    }
  };

  const skipTime = (seconds: number) => {
    const audio = audioRef.current;
    if (!audio) return;

    const newTime = Math.max(0, Math.min(duration, currentTime + seconds));
    audio.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const changePlaybackRate = () => {
    const rates = [0.5, 0.75, 1, 1.25, 1.5, 2];
    const currentIndex = rates.indexOf(playbackRate);
    const nextRate = rates[(currentIndex + 1) % rates.length];

    setPlaybackRate(nextRate);
    if (audioRef.current) {
      audioRef.current.playbackRate = nextRate;
    }
  };

  // Show loading or error state
  if (!episode.audioUrl || episode.status !== "ready") {
    return (
      <div className={`bg-base-200 rounded-xl p-6 ${className}`}>
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-base-300 rounded-lg flex items-center justify-center">
            {episode.status === "generating" ? (
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            ) : (
              <Music className="w-8 h-8 text-base-content/30" />
            )}
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-base-content">{episode.title}</h3>
            <p className="text-sm text-base-content/60">
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

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div
      className={`bg-gradient-to-r from-base-100 to-base-200 rounded-xl shadow-lg overflow-hidden ${className}`}
    >
      {/* Hidden HTML5 Audio Element */}
      <audio ref={audioRef} src={episode.audioUrl} preload="metadata" />

      {/* Episode Header */}
      <div className="bg-primary/10 px-6 py-4 border-b border-primary/20">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-primary/20 rounded-lg flex items-center justify-center">
            <Music className="w-7 h-7 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-lg text-base-content truncate">
              {episode.title}
            </h3>
            <p className="text-sm text-primary font-medium">
              Duration: {formatTime(episode.duration)} •{episode.playCount}{" "}
              plays
            </p>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Error Display */}
        {error && (
          <div className="mb-4 p-3 bg-error/10 border border-error/20 rounded-lg">
            <p className="text-sm text-error">{error}</p>
            <Button
              size="sm"
              btnStyle="outline"
              variant="error"
              onClick={() => setError(null)}
              className="mt-2"
            >
              Retry
            </Button>
          </div>
        )}

        {/* Main Controls */}
        <div className="flex items-center justify-center gap-4 mb-6">
          <Button
            size="sm"
            btnStyle="ghost"
            onClick={() => skipTime(-10)}
            disabled={!duration}
          >
            <SkipBack className="w-5 h-5" />
          </Button>

          <Button
            size="lg"
            variant="primary"
            className="btn-circle shadow-lg hover:scale-105 transition-transform"
            onClick={togglePlayPause}
            disabled={isLoading || !duration}
          >
            {isLoading ? (
              <Loader2 className="w-7 h-7 animate-spin" />
            ) : isPlaying ? (
              <Pause className="w-7 h-7" />
            ) : (
              <Play className="w-7 h-7 ml-1" />
            )}
          </Button>

          <Button
            size="sm"
            btnStyle="ghost"
            onClick={() => skipTime(10)}
            disabled={!duration}
          >
            <SkipForward className="w-5 h-5" />
          </Button>
        </div>

        {/* Progress Bar */}
        <div className="space-y-3 mb-6">
          <div
            className="h-2 bg-base-300 rounded-full cursor-pointer relative group"
            onClick={handleSeek}
          >
            <div
              className="h-full bg-primary rounded-full transition-all duration-150"
              style={{ width: `${progress}%` }}
            />
            <div
              className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-primary rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg border-2 border-white"
              style={{ left: `calc(${progress}% - 8px)` }}
            />
          </div>

          <div className="flex justify-between text-sm text-base-content/60">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Secondary Controls */}
        <div className="flex items-center justify-between">
          {/* Playback Speed */}
          <Button
            size="sm"
            btnStyle="ghost"
            onClick={changePlaybackRate}
            className="text-xs font-mono"
          >
            {playbackRate}x
          </Button>

          {/* Volume Control */}
          <div className="flex items-center gap-3 flex-1 max-w-xs mx-4">
            <Button size="sm" btnStyle="ghost" onClick={toggleMute}>
              {isMuted || volume === 0 ? (
                <VolumeX className="w-5 h-5" />
              ) : (
                <Volume2 className="w-5 h-5" />
              )}
            </Button>

            <div
              className="flex-1 h-1 bg-base-300 rounded-full cursor-pointer relative group"
              onClick={handleVolumeChange}
            >
              <div
                className="h-full bg-primary/70 rounded-full"
                style={{ width: `${isMuted ? 0 : volume * 100}%` }}
              />
              <div
                className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-primary rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ left: `calc(${(isMuted ? 0 : volume) * 100}% - 6px)` }}
              />
            </div>

            <span className="text-xs text-base-content/50 min-w-[3ch]">
              {Math.round((isMuted ? 0 : volume) * 100)}
            </span>
          </div>

          <Button
            size="sm"
            btnStyle="ghost"
            onClick={() => skipTime(-currentTime)}
            disabled={!duration || currentTime === 0}
          >
            <RotateCcw className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
