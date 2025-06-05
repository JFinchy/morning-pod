"use client";

import {
  Volume2,
  Settings,
  BarChart3,
  Play,
  Pause,
  Download,
  TestTube,
  Zap,
  Clock,
  DollarSign,
  TrendingUp,
  Mic,
} from "lucide-react";
import React, { useState, useRef } from "react";

import { Button } from "@/components/ui";
import { api } from "@/lib/trpc/client";

export default function TTSTestPage() {
  // TTS Request State
  const [ttsText, setTtsText] = useState(
    `
Welcome to the Morning Pod! Today we're exploring the latest developments in artificial intelligence and technology. 

OpenAI has announced significant improvements to their text-to-speech capabilities, making voice synthesis more natural and accessible than ever before. The new models offer better pronunciation, more natural pauses, and enhanced emotional expression.

This is just a sample of what our podcast episodes will sound like. We're excited to bring you the latest tech news in an engaging, audio-first format.
  `.trim()
  );

  const [ttsConfig, setTtsConfig] = useState({
    voice: "alloy" as const,
    provider: "openai" as const,
    format: "mp3" as const,
    quality: "medium" as const,
    speed: 1.0,
    pitch: 0,
    volume: 0.8,
  });

  const [metadata, setMetadata] = useState({
    title: "TTS Lab Test",
    source: "Internal Testing",
    episodeId: "",
  });

  // Audio Player State
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);

  // API Mutations and Queries
  const generateMutation = api.tts.generateAudio.useMutation();
  const testConfigMutation = api.tts.testConfiguration.useMutation();
  const updateConfigMutation = api.tts.updateConfig.useMutation();
  const clearCacheMutation = api.tts.clearCache.useMutation();

  // API Queries
  const { data: metrics, refetch: refetchMetrics } =
    api.tts.getMetrics.useQuery();
  const { data: config } = api.tts.getConfig.useQuery();
  const { data: voices } = api.tts.getSupportedVoices.useQuery();
  const { data: history } = api.tts.getHistory.useQuery({ limit: 10 });
  const { data: cacheStats } = api.tts.getCacheStats.useQuery();

  const handleGenerateAudio = async () => {
    try {
      await generateMutation.mutateAsync({
        text: ttsText,
        voice: ttsConfig.voice,
        provider: ttsConfig.provider,
        format: ttsConfig.format,
        quality: ttsConfig.quality,
        speed: ttsConfig.speed,
        pitch: ttsConfig.pitch,
        volume: ttsConfig.volume,
        metadata,
      });
      refetchMetrics();
    } catch (error) {
      console.error("TTS generation failed:", error);
    }
  };

  const handleTestConfig = async () => {
    try {
      await testConfigMutation.mutateAsync();
    } catch (error) {
      console.error("TTS configuration test failed:", error);
    }
  };

  const handleUpdateConfig = async () => {
    try {
      await updateConfigMutation.mutateAsync({
        defaultVoice: ttsConfig.voice,
        defaultFormat: ttsConfig.format,
        defaultQuality: ttsConfig.quality,
        defaultSpeed: ttsConfig.speed,
      });
    } catch (error) {
      console.error("TTS configuration update failed:", error);
    }
  };

  const handleClearCache = async () => {
    try {
      await clearCacheMutation.mutateAsync();
    } catch (error) {
      console.error("Cache clear failed:", error);
    }
  };

  // Audio Player Functions
  const togglePlayPause = () => {
    if (!audioRef.current || !generateMutation.data?.success) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleDownload = () => {
    if (generateMutation.data?.success && generateMutation.data.data) {
      const link = document.createElement("a");
      link.href = generateMutation.data.data.audioUrl;
      link.download = `tts-test.${generateMutation.data.data.format}`;
      link.click();
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const formatFileSize = (bytes: number) => {
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(2)} MB`;
  };

  return (
    <div className="min-h-screen bg-base-100">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Volume2 className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-bold">TTS Lab</h1>
          </div>
          <p className="text-base-content/70">
            Test and monitor text-to-speech audio generation
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - TTS Generation */}
          <div className="lg:col-span-2 space-y-6">
            {/* Text Input */}
            <div className="card bg-base-200 shadow-sm">
              <div className="card-body">
                <div className="flex items-center gap-2 mb-4">
                  <Mic className="w-5 h-5 text-primary" />
                  <h2 className="card-title">Text Input</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">Title</span>
                    </label>
                    <input
                      type="text"
                      className="input input-bordered input-sm"
                      value={metadata.title}
                      onChange={(e) =>
                        setMetadata((prev) => ({
                          ...prev,
                          title: e.target.value,
                        }))
                      }
                      placeholder="Episode title"
                    />
                  </div>
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">Source</span>
                    </label>
                    <input
                      type="text"
                      className="input input-bordered input-sm"
                      value={metadata.source}
                      onChange={(e) =>
                        setMetadata((prev) => ({
                          ...prev,
                          source: e.target.value,
                        }))
                      }
                      placeholder="Content source"
                    />
                  </div>
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Text to Convert</span>
                    <span className="label-text-alt">
                      {ttsText.length} characters
                    </span>
                  </label>
                  <textarea
                    className="textarea textarea-bordered h-40"
                    value={ttsText}
                    onChange={(e) => setTtsText(e.target.value)}
                    placeholder="Enter text to convert to speech..."
                  />
                </div>

                <Button
                  onClick={handleGenerateAudio}
                  disabled={generateMutation.isPending || !ttsText.trim()}
                  className="btn-primary"
                >
                  {generateMutation.isPending ? (
                    <>
                      <span className="loading loading-spinner loading-sm"></span>
                      Generating...
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4" />
                      Generate Audio
                    </>
                  )}
                </Button>

                {generateMutation.data && (
                  <div
                    className={`alert ${generateMutation.data.success ? "alert-success" : "alert-error"} text-sm`}
                  >
                    <span>
                      {generateMutation.data.success &&
                      generateMutation.data.data
                        ? `Audio generated successfully! Duration: ${formatTime(generateMutation.data.data.duration)}, Size: ${formatFileSize(generateMutation.data.data.audioSize)}, Cost: $${generateMutation.data.data.metadata.cost.toFixed(4)}`
                        : `Generation failed: ${generateMutation.data.error}`}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Audio Player */}
            {generateMutation.data?.success && (
              <div className="card bg-base-200 shadow-sm">
                <div className="card-body">
                  <h2 className="card-title mb-4">Audio Player</h2>

                  <audio
                    ref={audioRef}
                    src={generateMutation.data.data?.audioUrl}
                    onTimeUpdate={handleTimeUpdate}
                    onLoadedMetadata={handleLoadedMetadata}
                    onEnded={() => setIsPlaying(false)}
                    className="hidden"
                  />

                  <div className="flex items-center gap-4 mb-4">
                    <Button
                      onClick={togglePlayPause}
                      size="sm"
                      variant="primary"
                    >
                      {isPlaying ? (
                        <Pause className="w-4 h-4" />
                      ) : (
                        <Play className="w-4 h-4" />
                      )}
                    </Button>

                    <div className="flex-1">
                      <div className="flex justify-between text-xs mb-1">
                        <span>{formatTime(currentTime)}</span>
                        <span>{formatTime(duration)}</span>
                      </div>
                      <progress
                        className="progress progress-primary w-full"
                        value={duration ? (currentTime / duration) * 100 : 0}
                        max="100"
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      <Volume2 className="w-4 h-4" />
                      <input
                        type="range"
                        className="range range-xs range-primary w-20"
                        min="0"
                        max="1"
                        step="0.1"
                        value={volume}
                        onChange={(e) => {
                          const newVolume = parseFloat(e.target.value);
                          setVolume(newVolume);
                          if (audioRef.current) {
                            audioRef.current.volume = newVolume;
                          }
                        }}
                      />
                    </div>

                    <Button
                      onClick={handleDownload}
                      size="sm"
                      btnStyle="outline"
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div className="stat bg-base-100 rounded-lg p-3">
                      <div className="stat-title text-xs">Voice</div>
                      <div className="stat-value text-sm">
                        {generateMutation.data.data?.metadata.voice || "N/A"}
                      </div>
                    </div>
                    <div className="stat bg-base-100 rounded-lg p-3">
                      <div className="stat-title text-xs">Quality</div>
                      <div className="stat-value text-sm">
                        {generateMutation.data.data?.quality || "N/A"}
                      </div>
                    </div>
                    <div className="stat bg-base-100 rounded-lg p-3">
                      <div className="stat-title text-xs">Cache</div>
                      <div className="stat-value text-sm">
                        {generateMutation.data.data?.metadata.cacheHit
                          ? "✓ Hit"
                          : "✗ Miss"}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Voice Configuration */}
            <div className="card bg-base-200 shadow-sm">
              <div className="card-body">
                <div className="flex items-center gap-2 mb-4">
                  <Settings className="w-5 h-5 text-primary" />
                  <h2 className="card-title">Voice Configuration</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">Voice</span>
                    </label>
                    <select
                      className="select select-bordered select-sm"
                      value={ttsConfig.voice}
                      onChange={(e) =>
                        setTtsConfig((prev) => ({
                          ...prev,
                          voice: e.target.value as any,
                        }))
                      }
                    >
                      {voices?.success &&
                        voices.voices?.map((voice) => (
                          <option key={voice.voiceId} value={voice.voiceId}>
                            {voice.displayName} ({voice.gender}, {voice.accent})
                          </option>
                        ))}
                    </select>
                  </div>

                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">Quality</span>
                    </label>
                    <select
                      className="select select-bordered select-sm"
                      value={ttsConfig.quality}
                      onChange={(e) =>
                        setTtsConfig((prev) => ({
                          ...prev,
                          quality: e.target.value as any,
                        }))
                      }
                    >
                      <option value="low">Low (32kbps)</option>
                      <option value="medium">Medium (64kbps)</option>
                      <option value="high">High (128kbps)</option>
                      <option value="hd">HD (192kbps)</option>
                    </select>
                  </div>

                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">Speed</span>
                      <span className="label-text-alt">{ttsConfig.speed}x</span>
                    </label>
                    <input
                      type="range"
                      className="range range-primary range-sm"
                      min="0.25"
                      max="4.0"
                      step="0.25"
                      value={ttsConfig.speed}
                      onChange={(e) =>
                        setTtsConfig((prev) => ({
                          ...prev,
                          speed: parseFloat(e.target.value),
                        }))
                      }
                    />
                  </div>

                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">Format</span>
                    </label>
                    <select
                      className="select select-bordered select-sm"
                      value={ttsConfig.format}
                      onChange={(e) =>
                        setTtsConfig((prev) => ({
                          ...prev,
                          format: e.target.value as any,
                        }))
                      }
                    >
                      <option value="mp3">MP3</option>
                      <option value="wav">WAV</option>
                      <option value="flac">FLAC</option>
                      <option value="opus">Opus</option>
                    </select>
                  </div>
                </div>

                <div className="flex gap-2 mt-4">
                  <Button
                    onClick={handleTestConfig}
                    disabled={testConfigMutation.isPending}
                    className="btn-sm flex-1"
                    btnStyle="outline"
                  >
                    {testConfigMutation.isPending ? (
                      <span className="loading loading-spinner loading-xs"></span>
                    ) : (
                      "Test"
                    )}
                  </Button>
                  <Button
                    onClick={handleUpdateConfig}
                    disabled={updateConfigMutation.isPending}
                    className="btn-sm flex-1"
                  >
                    {updateConfigMutation.isPending ? (
                      <span className="loading loading-spinner loading-xs"></span>
                    ) : (
                      "Update"
                    )}
                  </Button>
                </div>

                {testConfigMutation.data && (
                  <div
                    className={`alert ${testConfigMutation.data.success ? "alert-success" : "alert-error"} text-xs mt-2`}
                  >
                    <span>
                      {testConfigMutation.data.success
                        ? "Configuration test passed!"
                        : `Test failed: ${testConfigMutation.data.error}`}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Metrics and History */}
          <div className="space-y-6">
            {/* Metrics */}
            <div className="card bg-base-200 shadow-sm">
              <div className="card-body">
                <div className="flex items-center gap-2 mb-4">
                  <BarChart3 className="w-5 h-5 text-primary" />
                  <h2 className="card-title">Metrics</h2>
                </div>

                {metrics?.success && metrics.metrics && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-2">
                      <div className="stat bg-base-100 rounded-lg p-3">
                        <div className="stat-title text-xs">Total Requests</div>
                        <div className="stat-value text-lg">
                          {metrics.metrics.totalRequests}
                        </div>
                      </div>
                      <div className="stat bg-base-100 rounded-lg p-3">
                        <div className="stat-title text-xs">Success Rate</div>
                        <div className="stat-value text-lg">
                          {metrics.metrics.totalRequests > 0
                            ? (
                                (metrics.metrics.successfulRequests /
                                  metrics.metrics.totalRequests) *
                                100
                              ).toFixed(1)
                            : 0}
                          %
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-2">
                      <div className="stat bg-base-100 rounded-lg p-3">
                        <div className="stat-title text-xs flex items-center gap-1">
                          <DollarSign className="w-3 h-3" />
                          Total Cost
                        </div>
                        <div className="stat-value text-lg">
                          ${metrics.metrics.totalCost.toFixed(4)}
                        </div>
                      </div>
                      <div className="stat bg-base-100 rounded-lg p-3">
                        <div className="stat-title text-xs flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          Audio Generated
                        </div>
                        <div className="stat-value text-lg">
                          {formatTime(metrics.metrics.totalDuration)}
                        </div>
                      </div>
                      <div className="stat bg-base-100 rounded-lg p-3">
                        <div className="stat-title text-xs flex items-center gap-1">
                          <TrendingUp className="w-3 h-3" />
                          Cache Hit Rate
                        </div>
                        <div className="stat-value text-lg">
                          {(metrics.metrics.cacheHitRate * 100).toFixed(1)}%
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Cache Statistics */}
            {cacheStats?.success && (
              <div className="card bg-base-200 shadow-sm">
                <div className="card-body">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="card-title">Cache</h2>
                    <Button
                      onClick={handleClearCache}
                      disabled={clearCacheMutation.isPending}
                      size="xs"
                      btnStyle="outline"
                    >
                      Clear
                    </Button>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Entries:</span>
                      <span>{cacheStats.cache.size}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Total Size:</span>
                      <span>{formatFileSize(cacheStats.cache.totalSize)}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Recent History */}
            {history?.success && history.history.length > 0 && (
              <div className="card bg-base-200 shadow-sm">
                <div className="card-body">
                  <h2 className="card-title mb-4">Recent History</h2>
                  <div className="space-y-2">
                    {history.history.slice(0, 5).map((entry: any) => (
                      <div
                        key={entry.id}
                        className="bg-base-100 p-3 rounded-lg"
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <p className="font-medium text-sm">
                              {entry.request.metadata?.title || "Untitled"}
                            </p>
                            <p className="text-xs text-base-content/60">
                              {entry.request.voice}
                            </p>
                          </div>
                          <div
                            className={`badge ${entry.success ? "badge-success" : "badge-error"} badge-sm`}
                          >
                            {entry.success ? "Success" : "Failed"}
                          </div>
                        </div>
                        <p className="text-xs text-base-content/60 mt-1">
                          {new Date(entry.timestamp).toLocaleTimeString()}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
