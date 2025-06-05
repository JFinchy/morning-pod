"use client";

import { useState } from "react";

import {
  EpisodeCardV1,
  EpisodeCardV2,
  EpisodeCardV3,
} from "@/components/internal/variants";
import { mockEpisodes } from "@/lib/mock-data/episodes";

export default function EpisodeCardShowcase() {
  const [selectedEpisode] = useState(mockEpisodes[0]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-base-content mb-2">
          Episode Card Variants
        </h1>
        <p className="text-base-content/60 max-w-2xl mx-auto">
          Compare different episode card designs to see which approach works
          best for displaying podcast episodes. Each variant emphasizes
          different aspects of the episode information.
        </p>
      </div>

      {/* Design Goals */}
      <div className="card bg-base-200 border border-base-300">
        <div className="card-body">
          <h2 className="card-title">Design Goals</h2>
          <div className="grid md:grid-cols-3 gap-4 text-sm">
            <div>
              <h3 className="font-semibold text-primary mb-2">V1: Minimal</h3>
              <ul className="text-base-content/70 space-y-1">
                <li>• Clean, simple layout</li>
                <li>• Fast loading</li>
                <li>• Focuses on content</li>
                <li>• High information density</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-primary mb-2">V2: Visual</h3>
              <ul className="text-base-content/70 space-y-1">
                <li>• Rich visual design</li>
                <li>• Gradient backgrounds</li>
                <li>• Prominent status indicators</li>
                <li>• Engaging interactions</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-primary mb-2">V3: Compact</h3>
              <ul className="text-base-content/70 space-y-1">
                <li>• List-style layout</li>
                <li>• Space efficient</li>
                <li>• Quick scanning</li>
                <li>• Mobile optimized</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Variant Comparisons */}
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Version 1: Minimal */}
        <div className="space-y-4">
          <div className="text-center">
            <h3 className="text-xl font-semibold text-base-content">
              V1: Minimal
            </h3>
            <p className="text-sm text-base-content/60">
              Clean, content-focused design
            </p>
          </div>
          <EpisodeCardV1 episode={selectedEpisode} />
        </div>

        {/* Version 2: Visual */}
        <div className="space-y-4">
          <div className="text-center">
            <h3 className="text-xl font-semibold text-base-content">
              V2: Visual
            </h3>
            <p className="text-sm text-base-content/60">
              Rich visual design with gradients
            </p>
          </div>
          <EpisodeCardV2 episode={selectedEpisode} />
        </div>

        {/* Version 3: Compact */}
        <div className="space-y-4">
          <div className="text-center">
            <h3 className="text-xl font-semibold text-base-content">
              V3: Compact
            </h3>
            <p className="text-sm text-base-content/60">
              Space-efficient list layout
            </p>
          </div>
          <EpisodeCardV3 episode={selectedEpisode} />
        </div>
      </div>

      {/* Different States */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-base-content text-center">
          Different Episode States
        </h2>

        {/* Ready State */}
        <div>
          <h3 className="text-lg font-semibold text-base-content mb-4">
            Ready Episodes
          </h3>
          <div className="grid lg:grid-cols-3 gap-6">
            <EpisodeCardV1 episode={mockEpisodes[0]} />
            <EpisodeCardV2 episode={mockEpisodes[0]} />
            <EpisodeCardV3 episode={mockEpisodes[0]} />
          </div>
        </div>

        {/* Generating State */}
        <div>
          <h3 className="text-lg font-semibold text-base-content mb-4">
            Generating Episodes
          </h3>
          <div className="grid lg:grid-cols-3 gap-6">
            <EpisodeCardV1 episode={mockEpisodes[2]} />
            <EpisodeCardV2 episode={mockEpisodes[2]} />
            <EpisodeCardV3 episode={mockEpisodes[2]} />
          </div>
        </div>

        {/* Failed State */}
        <div>
          <h3 className="text-lg font-semibold text-base-content mb-4">
            Failed Episodes
          </h3>
          <div className="grid lg:grid-cols-3 gap-6">
            <EpisodeCardV1 episode={mockEpisodes[5]} />
            <EpisodeCardV2 episode={mockEpisodes[5]} />
            <EpisodeCardV3 episode={mockEpisodes[5]} />
          </div>
        </div>
      </div>

      {/* Performance Considerations */}
      <div className="card bg-base-200 border border-base-300">
        <div className="card-body">
          <h2 className="card-title">Performance Analysis</h2>
          <div className="grid md:grid-cols-3 gap-6 text-sm">
            <div>
              <h3 className="font-semibold mb-2">V1: Minimal</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Bundle Size:</span>
                  <span className="text-success">Smallest</span>
                </div>
                <div className="flex justify-between">
                  <span>Render Time:</span>
                  <span className="text-success">Fastest</span>
                </div>
                <div className="flex justify-between">
                  <span>Memory Usage:</span>
                  <span className="text-success">Lowest</span>
                </div>
              </div>
            </div>
            <div>
              <h3 className="font-semibold mb-2">V2: Visual</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Bundle Size:</span>
                  <span className="text-warning">Medium</span>
                </div>
                <div className="flex justify-between">
                  <span>Render Time:</span>
                  <span className="text-warning">Medium</span>
                </div>
                <div className="flex justify-between">
                  <span>Memory Usage:</span>
                  <span className="text-warning">Medium</span>
                </div>
              </div>
            </div>
            <div>
              <h3 className="font-semibold mb-2">V3: Compact</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Bundle Size:</span>
                  <span className="text-success">Small</span>
                </div>
                <div className="flex justify-between">
                  <span>Render Time:</span>
                  <span className="text-success">Fast</span>
                </div>
                <div className="flex justify-between">
                  <span>Memory Usage:</span>
                  <span className="text-success">Low</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
