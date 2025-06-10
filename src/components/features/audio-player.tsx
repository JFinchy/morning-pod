"use client";

import {
  Loader2,
  Music,
  Pause,
  Play,
  RotateCcw,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui";
import { type Episode } from "@/lib/db/schema";

interface AudioPlayerProps {
  autoPlay?: boolean;
  className?: string;
  episode: Episode;
  onEpisodeEnd?: () => void;
  onTimeUpdate?: (currentTime: number, duration: number) => void;
}

export function AudioPlayer({
  autoPlay = false,
  className = "",
  episode,
  onEpisodeEnd,
  onTimeUpdate,
}: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<null | string>(null);
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
    } catch (error_) {
      console.error("Playback error:", error_);
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
          <div className="bg-base-300 flex h-16 w-16 items-center justify-center rounded-lg">
            {episode.status === "generating" ? (
              <Loader2 className="text-primary h-8 w-8 animate-spin" />
            ) : (
              <Music className="text-base-content/30 h-8 w-8" />
            )}
          </div>
          <div className="flex-1">
            <h3 className="text-base-content font-semibold">{episode.title}</h3>
            <p className="text-base-content/60 text-sm">
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
      className={`from-base-100 to-base-200 overflow-hidden rounded-xl bg-gradient-to-r shadow-lg ${className}`}
    >
      {/* Hidden HTML5 Audio Element */}
      <audio
        controlsList="nodownload nofullscreen noremoteplayback"
        crossOrigin="anonymous"
        preload="metadata"
        ref={audioRef}
        src={episode.audioUrl}
      />

      {/* Episode Header */}
      <div className="bg-primary/10 border-primary/20 border-b px-6 py-4">
        <div className="flex items-center gap-4">
          <div className="bg-primary/20 flex h-14 w-14 items-center justify-center rounded-lg">
            <Music className="text-primary h-7 w-7" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-base-content truncate text-lg font-bold">
              {episode.title}
            </h3>
            <p className="text-primary text-sm font-medium">
              Duration: {formatTime(episode.duration)} •{episode.playCount}{" "}
              plays
            </p>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Error Display */}
        {error && (
          <div className="bg-error/10 border-error/20 mb-4 rounded-lg border p-3">
            <p className="text-error text-sm">{error}</p>
            <Button
              btnStyle="outline"
              className="mt-2"
              onClick={() => setError(null)}
              size="sm"
              variant="error"
            >
              Retry
            </Button>
          </div>
        )}

        {/* Main Controls */}
        <div className="mb-6 flex items-center justify-center gap-4">
          <Button
            btnStyle="ghost"
            disabled={!duration}
            onClick={() => skipTime(-10)}
            size="sm"
          >
            <SkipBack className="h-5 w-5" />
          </Button>

          <Button
            className="btn-circle shadow-lg transition-transform hover:scale-105"
            disabled={isLoading || !duration}
            onClick={togglePlayPause}
            size="lg"
            variant="primary"
          >
            {isLoading ? (
              <Loader2 className="h-7 w-7 animate-spin" />
            ) : isPlaying ? (
              <Pause className="h-7 w-7" />
            ) : (
              <Play className="ml-1 h-7 w-7" />
            )}
          </Button>

          <Button
            btnStyle="ghost"
            disabled={!duration}
            onClick={() => skipTime(10)}
            size="sm"
          >
            <SkipForward className="h-5 w-5" />
          </Button>
        </div>

        {/* Progress Bar */}
        <div className="mb-6 space-y-3">
          <div
            className="bg-base-300 group relative h-2 cursor-pointer rounded-full"
            onClick={handleSeek}
          >
            <div
              className="bg-primary h-full rounded-full transition-all duration-150"
              style={{ width: `${progress}%` }}
            />
            <div
              className="bg-primary absolute top-1/2 h-4 w-4 -translate-y-1/2 rounded-full border-2 border-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100"
              style={{ left: `calc(${progress}% - 8px)` }}
            />
          </div>

          <div className="text-base-content/60 flex justify-between text-sm">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Secondary Controls */}
        <div className="flex items-center justify-between">
          {/* Playback Speed */}
          <Button
            btnStyle="ghost"
            className="font-mono text-xs"
            onClick={changePlaybackRate}
            size="sm"
          >
            {playbackRate}x
          </Button>

          {/* Volume Control */}
          <div className="mx-4 flex max-w-xs flex-1 items-center gap-3">
            <Button btnStyle="ghost" onClick={toggleMute} size="sm">
              {isMuted || volume === 0 ? (
                <VolumeX className="h-5 w-5" />
              ) : (
                <Volume2 className="h-5 w-5" />
              )}
            </Button>

            <div
              className="bg-base-300 group relative h-1 flex-1 cursor-pointer rounded-full"
              onClick={handleVolumeChange}
            >
              <div
                className="bg-primary/70 h-full rounded-full"
                style={{ width: `${isMuted ? 0 : volume * 100}%` }}
              />
              <div
                className="bg-primary absolute top-1/2 h-3 w-3 -translate-y-1/2 rounded-full opacity-0 transition-opacity group-hover:opacity-100"
                style={{ left: `calc(${(isMuted ? 0 : volume) * 100}% - 6px)` }}
              />
            </div>

            <span className="text-base-content/50 min-w-[3ch] text-xs">
              {Math.round((isMuted ? 0 : volume) * 100)}
            </span>
          </div>

          <Button
            btnStyle="ghost"
            disabled={!duration || currentTime === 0}
            onClick={() => skipTime(-currentTime)}
            size="sm"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
