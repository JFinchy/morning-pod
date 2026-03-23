"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
  useEffect,
} from "react";
import { type Episode } from "@/lib/db/schema";
import { api } from "@/lib/trpc/client";

interface AudioContextType {
  currentEpisode: Episode | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  playbackRate: number;
  isMuted: boolean;
  playEpisode: (episode: Episode) => void;
  pauseEpisode: () => void;
  togglePlayPause: () => void;
  stopEpisode: () => void;
  seek: (time: number) => void;
  setVolume: (volume: number) => void;
  setPlaybackRate: (rate: number) => void;
  toggleMute: () => void;

  // Queue Management
  queue: Episode[];
  addToQueue: (episode: Episode) => void;
  removeFromQueue: (index: number) => void;
  reorderQueue: (startIndex: number, endIndex: number) => void;
  playNext: () => void;
  playPrevious: () => void;
  clearQueue: () => void;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export function AudioProvider({ children }: { children: React.ReactNode }) {
  const [currentEpisode, setCurrentEpisode] = useState<Episode | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDurationState] = useState(0);
  const [volume, setVolumeState] = useState(0.8);
  const [playbackRate, setPlaybackRateState] = useState(1);
  const [isMuted, setIsMuted] = useState(false);

  // Queue state
  const [queue, setQueue] = useState<Episode[]>([]);
  const [playHistory, setPlayHistory] = useState<Episode[]>([]);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const incrementPlayCount = api.episodes.incrementPlayCount.useMutation();

  // Sync duration with episode if metadata not loaded
  const durationValue = duration || currentEpisode?.duration || 0;

  // Initialize and load from local storage
  useEffect(() => {
    // Create audio element once
    audioRef.current = new Audio();
    const audio = audioRef.current;

    // Load saved state
    const savedEpisode = localStorage.getItem("last_played_episode");
    const savedTime = localStorage.getItem("last_played_time");
    const savedVolume = localStorage.getItem("player_volume");

    if (savedEpisode) {
      try {
        const episode = JSON.parse(savedEpisode);
        setCurrentEpisode(episode);
        if (episode.audioUrl) {
          audio.src = episode.audioUrl;

          if (savedTime) {
            const time = parseFloat(savedTime);
            audio.currentTime = time;
            setCurrentTime(time);
          }
        }
      } catch (e) {
        console.error("Failed to load saved audio state", e);
      }
    }

    if (savedVolume) {
      const v = parseFloat(savedVolume);
      audio.volume = v;
      setVolumeState(v);
    }

    // Load queue state
    const savedQueue = localStorage.getItem("audio_queue");
    if (savedQueue) {
      try {
        setQueue(JSON.parse(savedQueue));
      } catch (e) {
        console.error("Failed to load saved audio queue", e);
      }
    }

    // Disable ESLint warnings around unused refs to prevent compilation errors if not handled inside hooks
    // eslint-disable-next-line
    const handleLoadedMetadata = () => setDurationState(audio.duration);
    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
      // Persist time occasionally (throttled)
      if (Math.floor(audio.currentTime) % 5 === 0) {
        localStorage.setItem("last_played_time", audio.currentTime.toString());
      }
    };

    // We bind handleEnded at the end so it can access the latest state in playNext
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("play", handlePlay);
    audio.addEventListener("pause", handlePause);

    return () => {
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("play", handlePlay);
      audio.removeEventListener("pause", handlePause);
      audio.pause();
      audio.src = "";
    };
  }, []);

  const playEpisode = useCallback(
    (episode: Episode) => {
      const audio = audioRef.current;
      if (!audio) return;

      if (currentEpisode?.id === episode.id) {
        audio.play().catch(console.error);
      } else {
        if (currentEpisode) {
          setPlayHistory((prev) => [...prev, currentEpisode]);
        }

        setCurrentEpisode(episode);
        setDurationState(0); // Reset for new episode
        localStorage.setItem("last_played_episode", JSON.stringify(episode));

        // Increment play count for the new episode
        incrementPlayCount.mutate({ id: episode.id });

        if (episode.audioUrl) {
          audio.src = episode.audioUrl;
          audio.play().catch(console.error);
        }
      }
    },
    [currentEpisode]
  );

  const pauseEpisode = useCallback(() => {
    audioRef.current?.pause();
  }, []);

  const togglePlayPause = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play().catch(console.error);
    }
  }, [isPlaying]);

  const stopEpisode = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.pause();
    audio.src = "";
    setCurrentEpisode(null);
    setIsPlaying(false);
    setCurrentTime(0);
    setDurationState(0);
    localStorage.removeItem("last_played_episode");
    localStorage.removeItem("last_played_time");
  }, []);

  const seek = useCallback((time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
      localStorage.setItem("last_played_time", time.toString());
    }
  }, []);

  const setVolume = useCallback((v: number) => {
    if (audioRef.current) {
      audioRef.current.volume = v;
      setVolumeState(v);
      localStorage.setItem("player_volume", v.toString());
    }
  }, []);

  const setPlaybackRate = useCallback((rate: number) => {
    if (audioRef.current) {
      audioRef.current.playbackRate = rate;
      setPlaybackRateState(rate);
    }
  }, []);

  const toggleMute = useCallback(() => {
    if (audioRef.current) {
      const newMuted = !isMuted;
      audioRef.current.muted = newMuted;
      setIsMuted(newMuted);
    }
  }, [isMuted]);

  // --- Queue Actions ---

  const playNext = useCallback(() => {
    if (queue.length > 0) {
      const nextEpisode = queue[0];
      const newQueue = queue.slice(1);

      setQueue(newQueue);
      localStorage.setItem("audio_queue", JSON.stringify(newQueue));

      playEpisode(nextEpisode);
    } else {
      setIsPlaying(false);
      setCurrentTime(0);
      localStorage.removeItem("last_played_time");
    }
  }, [queue, playEpisode]);

  const playPrevious = useCallback(() => {
    if (audioRef.current && currentTime > 3) {
      // If we're more than 3 seconds in, restart the current episode
      seek(0);
      return;
    }

    if (playHistory.length > 0) {
      const prevEpisode = playHistory[playHistory.length - 1];
      const newHistory = playHistory.slice(0, -1);

      setPlayHistory(newHistory);

      // Put current episode back on top of queue
      if (currentEpisode) {
        const newQueue = [currentEpisode, ...queue];
        setQueue(newQueue);
        localStorage.setItem("audio_queue", JSON.stringify(newQueue));
      }

      // Manually bypass playEpisode history push
      const audio = audioRef.current;
      if (audio) {
        setCurrentEpisode(prevEpisode);
        setDurationState(0);
        localStorage.setItem(
          "last_played_episode",
          JSON.stringify(prevEpisode)
        );

        incrementPlayCount.mutate({ id: prevEpisode.id });

        if (prevEpisode.audioUrl) {
          audio.src = prevEpisode.audioUrl;
          audio.play().catch(console.error);
        }
      }
    }
  }, [
    playHistory,
    currentTime,
    currentEpisode,
    queue,
    seek,
    incrementPlayCount,
  ]);

  const addToQueue = useCallback(
    (episode: Episode) => {
      setQueue((prev) => {
        // Don't add if already in queue or currently playing
        if (
          currentEpisode?.id === episode.id ||
          prev.find((e) => e.id === episode.id)
        ) {
          return prev;
        }

        const newQueue = [...prev, episode];
        localStorage.setItem("audio_queue", JSON.stringify(newQueue));

        // If nothing is playing and no current episode, start playing automatically
        if (!currentEpisode && !isPlaying) {
          // Need timeout to allow state to settle before playing
          setTimeout(() => playNext(), 0);
        }

        return newQueue;
      });
    },
    [currentEpisode, isPlaying, playNext]
  );

  const removeFromQueue = useCallback((index: number) => {
    setQueue((prev) => {
      const newQueue = [...prev];
      newQueue.splice(index, 1);
      localStorage.setItem("audio_queue", JSON.stringify(newQueue));
      return newQueue;
    });
  }, []);

  const reorderQueue = useCallback((startIndex: number, endIndex: number) => {
    setQueue((prev) => {
      const newQueue = Array.from(prev);
      const [removed] = newQueue.splice(startIndex, 1);
      newQueue.splice(endIndex, 0, removed);
      localStorage.setItem("audio_queue", JSON.stringify(newQueue));
      return newQueue;
    });
  }, []);

  const clearQueue = useCallback(() => {
    setQueue([]);
    localStorage.removeItem("audio_queue");
  }, []);

  // Sync handleEnded with current context
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleEnded = () => {
      playNext();
    };

    audio.addEventListener("ended", handleEnded);
    return () => audio.removeEventListener("ended", handleEnded);
  }, [playNext]);

  return (
    <AudioContext.Provider
      value={{
        currentEpisode,
        isPlaying,
        currentTime,
        duration: durationValue,
        volume,
        playbackRate,
        isMuted,
        playEpisode,
        pauseEpisode,
        togglePlayPause,
        stopEpisode,
        seek,
        setVolume,
        setPlaybackRate,
        toggleMute,

        // Queue
        queue,
        addToQueue,
        removeFromQueue,
        reorderQueue,
        playNext,
        playPrevious,
        clearQueue,
      }}
    >
      {children}
    </AudioContext.Provider>
  );
}

export function useAudio() {
  const context = useContext(AudioContext);
  if (context === undefined) {
    throw new Error("useAudio must be used within an AudioProvider");
  }
  return context;
}
