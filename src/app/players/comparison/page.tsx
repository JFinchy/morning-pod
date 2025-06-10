"use client";

import { ArrowLeft, Settings } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import {
  EpisodePlayerV1,
  EpisodePlayerV2,
  EpisodePlayerV3,
} from "@/components/internal/variants";
import { mockEpisodes } from "@/lib/mock-data";

export default function PlayerComparisonPage() {
  const [selectedEpisodeIndex, setSelectedEpisodeIndex] = useState(0);
  const [currentTime, setCurrentTime] = useState(30); // 30 seconds in
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.8);

  const episode = mockEpisodes[selectedEpisodeIndex] || mockEpisodes[0];
  const duration = 300; // 5 minutes

  const playerVariants = [
    {
      component: EpisodePlayerV1,
      description:
        "Classic audio player design with colored header and traditional controls",
      name: "Traditional Player with Header (V1)",
      strengths: [
        "Familiar interface",
        "Clear time display",
        "Visual hierarchy",
        "Easy to understand",
      ],
      useCase:
        "Users who prefer traditional audio player interfaces with modern visual appeal",
    },
    {
      component: EpisodePlayerV2,
      description:
        "Modern streaming-style player with visual emphasis and premium feel",
      name: "Spotify-Inspired (V2)",
      strengths: [
        "Modern aesthetic",
        "Rich visual feedback",
        "Engaging interaction",
      ],
      useCase: "Users who want a premium, visually rich experience",
    },
    {
      component: EpisodePlayerV3,
      description:
        "Compact design with waveform visualization and space efficiency",
      name: "Minimalist Waveform (V3)",
      strengths: ["Space efficient", "Visual waveform", "Clean minimal design"],
      useCase: "Users who prefer compact, functional interfaces",
    },
  ];

  return (
    <div className="bg-base-200 min-h-screen">
      {/* Header */}
      <div className="bg-base-100 border-base-300 border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link className="btn btn-ghost btn-sm" href="/">
                <ArrowLeft className="h-4 w-4" />
                Back
              </Link>
              <div>
                <h1 className="text-base-content text-2xl font-bold">
                  Episode Player Variants
                </h1>
                <p className="text-base-content/60">
                  Compare different player designs and interactions
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button className="btn btn-ghost btn-sm">
                <Settings className="h-4 w-4" />
                Settings
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Episode Selector */}
        <div className="card bg-base-100 mb-8 shadow-sm">
          <div className="card-body p-6">
            <h2 className="mb-4 text-lg font-semibold">Test Episode</h2>
            <div className="flex flex-wrap gap-2">
              {mockEpisodes.map((ep, index) => (
                <button
                  className={`btn btn-sm ${
                    selectedEpisodeIndex === index
                      ? "btn-primary"
                      : "btn-outline"
                  }`}
                  key={ep.id}
                  onClick={() => setSelectedEpisodeIndex(index)}
                >
                  {ep.title}
                </button>
              ))}
            </div>

            {/* Playback Controls */}
            <div className="mt-4 flex items-center gap-4">
              <button
                className={`btn btn-sm ${isPlaying ? "btn-secondary" : "btn-primary"}`}
                onClick={() => setIsPlaying(!isPlaying)}
              >
                {isPlaying ? "Pause All" : "Play All"}
              </button>
              <div className="flex items-center gap-2">
                <span className="text-sm">Current Time:</span>
                <input
                  className="range range-primary range-sm"
                  max={duration}
                  min="0"
                  onChange={(e) => setCurrentTime(Number(e.target.value))}
                  type="range"
                  value={currentTime}
                />
                <span className="text-base-content/60 text-sm">
                  {Math.floor(currentTime / 60)}:
                  {(currentTime % 60).toString().padStart(2, "0")}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Player Variants Grid */}
        <div className="grid gap-8 lg:grid-cols-1 xl:grid-cols-3">
          {playerVariants.map((variant, index) => {
            const PlayerComponent = variant.component;

            return (
              <div className="space-y-4" key={index}>
                {/* Variant Info */}
                <div className="card bg-base-100 shadow-sm">
                  <div className="card-body p-4">
                    <h3 className="text-primary text-lg font-semibold">
                      {variant.name}
                    </h3>
                    <p className="text-base-content/70 mb-3 text-sm">
                      {variant.description}
                    </p>

                    <div className="space-y-2">
                      <div>
                        <span className="text-base-content/60 text-xs font-medium">
                          Strengths:
                        </span>
                        <ul className="text-base-content/70 ml-2 text-xs">
                          {variant.strengths.map((strength, i) => (
                            <li key={i}>• {strength}</li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <span className="text-base-content/60 text-xs font-medium">
                          Best for:
                        </span>
                        <p className="text-base-content/70 text-xs">
                          {variant.useCase}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Player Component */}
                <div className="space-y-2">
                  <PlayerComponent
                    currentTime={currentTime}
                    duration={duration}
                    episode={episode}
                    isPlaying={isPlaying}
                    onPlayPause={() => setIsPlaying(!isPlaying)}
                    onSeek={setCurrentTime}
                    onVolumeChange={setVolume}
                    volume={volume}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Design Notes */}
        <div className="card bg-base-100 mt-8 shadow-sm">
          <div className="card-body p-6">
            <h2 className="mb-4 text-lg font-semibold">Design Philosophy</h2>
            <div className="prose prose-sm">
              <p>
                Each player variant targets different user preferences and use
                cases:
              </p>
              <ul>
                <li>
                  <strong>V1 (Traditional):</strong> Focuses on clarity and
                  familiarity, perfect for users who want a straightforward
                  audio experience
                </li>
                <li>
                  <strong>V2 (Spotify-Inspired):</strong> Emphasizes visual
                  richness and modern streaming aesthetics for an engaging
                  experience
                </li>
                <li>
                  <strong>V3 (Minimalist):</strong> Prioritizes space efficiency
                  and unique waveform visualization for compact interfaces
                </li>
              </ul>
              <p>
                All variants share core functionality while expressing different
                design personalities. Test each variant to see which resonates
                best with your user base.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
