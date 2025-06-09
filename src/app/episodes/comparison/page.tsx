"use client";

import { ArrowLeft, Eye, Grid, List } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import {
  EpisodeCardV1,
  EpisodeCardV2,
  EpisodeCardV3,
} from "@/components/internal/variants";
import { MainLayout } from "@/components/layouts";
import { Button } from "@/components/ui/button";
import { mockEpisodes } from "@/lib/mock-data/episodes";

export default function EpisodeComparisonPage() {
  const [selectedEpisode, setSelectedEpisode] = useState(0);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const episode = mockEpisodes[selectedEpisode];

  // TODO: Implement episode playback handlers
  // const handlePlay = () => console.log("Play episode:", episode.id);
  // const handlePause = () => console.log("Pause episode:", episode.id);

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link className="btn btn-ghost btn-circle" href="/">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-base-content">
                Episode Card Variants
              </h1>
              <p className="text-base-content/70 mt-1">
                Compare different design approaches for episode cards
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              onClick={() => setViewMode("grid")}
              size="sm"
              variant={viewMode === "grid" ? "primary" : "neutral"}
            >
              <Grid className="w-4 h-4" />
            </Button>
            <Button
              onClick={() => setViewMode("list")}
              size="sm"
              variant={viewMode === "list" ? "primary" : "neutral"}
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Episode Selector */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Eye className="w-4 h-4 text-base-content/60" />
            <span className="text-sm font-medium text-base-content/60">
              Preview Episode:
            </span>
          </div>
          <div className="flex gap-2 flex-wrap">
            {mockEpisodes.map((ep, index) => (
              <button
                className={`btn btn-sm ${
                  selectedEpisode === index ? "btn-primary" : "btn-outline"
                }`}
                key={ep.id}
                onClick={() => setSelectedEpisode(index)}
              >
                {ep.source?.name || `Episode ${index + 1}`}
              </button>
            ))}
          </div>
        </div>

        {/* Variants Showcase */}
        {viewMode === "grid" ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Version 1 - Minimal */}
            <div>
              <div className="mb-4">
                <h2 className="text-xl font-semibold text-base-content mb-2">
                  Version 1: Minimal
                </h2>
                <p className="text-sm text-base-content/70">
                  Clean typography, simple layout, focus on content readability.
                  Ideal for content-heavy interfaces.
                </p>
                <div className="mt-2 flex gap-1">
                  <span className="badge badge-sm badge-outline">Clean</span>
                  <span className="badge badge-sm badge-outline">Readable</span>
                  <span className="badge badge-sm badge-outline">Minimal</span>
                </div>
              </div>
              <EpisodeCardV1 episode={episode} />
            </div>

            {/* Version 2 - Visual */}
            <div>
              <div className="mb-4">
                <h2 className="text-xl font-semibold text-base-content mb-2">
                  Version 2: Visual
                </h2>
                <p className="text-sm text-base-content/70">
                  Rich visuals, gradient backgrounds, prominent thumbnails.
                  Great for discovery and engagement.
                </p>
                <div className="mt-2 flex gap-1">
                  <span className="badge badge-sm badge-outline">Visual</span>
                  <span className="badge badge-sm badge-outline">Engaging</span>
                  <span className="badge badge-sm badge-outline">Rich</span>
                </div>
              </div>
              <EpisodeCardV2 episode={episode} />
            </div>

            {/* Version 3 - Compact */}
            <div>
              <div className="mb-4">
                <h2 className="text-xl font-semibold text-base-content mb-2">
                  Version 3: Compact
                </h2>
                <p className="text-sm text-base-content/70">
                  Space-efficient, list-style layout, perfect for showing many
                  episodes in limited space.
                </p>
                <div className="mt-2 flex gap-1">
                  <span className="badge badge-sm badge-outline">Compact</span>
                  <span className="badge badge-sm badge-outline">
                    Efficient
                  </span>
                  <span className="badge badge-sm badge-outline">Dense</span>
                </div>
              </div>
              <div className="bg-base-200/50 rounded-lg p-4">
                <EpisodeCardV3 episode={episode} />
              </div>
            </div>
          </div>
        ) : (
          /* List View - Stacked Comparison */
          <div className="space-y-12">
            {[
              {
                component: EpisodeCardV1,
                description:
                  "Clean typography, simple layout, focus on content readability. Ideal for content-heavy interfaces.",
                tags: ["Clean", "Readable", "Minimal"],
                title: "Version 1: Minimal",
              },
              {
                component: EpisodeCardV2,
                description:
                  "Rich visuals, gradient backgrounds, prominent thumbnails. Great for discovery and engagement.",
                tags: ["Visual", "Engaging", "Rich"],
                title: "Version 2: Visual",
              },
              {
                component: EpisodeCardV3,
                description:
                  "Space-efficient, list-style layout, perfect for showing many episodes in limited space.",
                tags: ["Compact", "Efficient", "Dense"],
                title: "Version 3: Compact",
              },
            ].map(
              ({ component: Component, description, tags, title }, index) => (
                <div
                  className="border border-base-300 rounded-lg p-6"
                  key={index}
                >
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-1">
                      <h2 className="text-xl font-semibold text-base-content mb-2">
                        {title}
                      </h2>
                      <p className="text-sm text-base-content/70 mb-3">
                        {description}
                      </p>
                      <div className="flex gap-1 flex-wrap">
                        {tags.map((tag) => (
                          <span
                            className="badge badge-sm badge-outline"
                            key={tag}
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="lg:col-span-2">
                      {index === 2 ? (
                        <div className="bg-base-200/50 rounded-lg p-4">
                          <Component episode={episode} />
                        </div>
                      ) : (
                        <Component episode={episode} />
                      )}
                    </div>
                  </div>
                </div>
              )
            )}
          </div>
        )}

        {/* Design Notes */}
        <div className="mt-12 p-6 bg-base-200 rounded-lg">
          <h3 className="text-lg font-semibold text-base-content mb-3">
            Design Philosophy
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
            <div>
              <h4 className="font-medium text-base-content mb-2">
                Minimal (V1)
              </h4>
              <p className="text-base-content/70">
                Prioritizes content readability and clean aesthetics. Uses
                minimal visual elements to keep focus on the episode
                information. Best for users who prefer functionality over form.
              </p>
            </div>
            <div>
              <h4 className="font-medium text-base-content mb-2">
                Visual (V2)
              </h4>
              <p className="text-base-content/70">
                Emphasizes visual appeal and engagement. Uses gradients, larger
                elements, and rich interactions. Ideal for discovery-focused
                interfaces and visual learners.
              </p>
            </div>
            <div>
              <h4 className="font-medium text-base-content mb-2">
                Compact (V3)
              </h4>
              <p className="text-base-content/70">
                Maximizes information density while maintaining usability.
                Perfect for power users who need to scan through many episodes
                quickly and efficiently.
              </p>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
