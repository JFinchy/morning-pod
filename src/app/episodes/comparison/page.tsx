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

  const episode = mockEpisodes[selectedEpisode] || mockEpisodes[0];

  // TODO: Implement episode playback handlers
  // const handlePlay = () => console.log("Play episode:", episode.id);
  // const handlePause = () => console.log("Pause episode:", episode.id);

  return (
    <MainLayout>
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link className="btn btn-ghost btn-circle" href="/">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="text-base-content text-3xl font-bold">
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
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              onClick={() => setViewMode("list")}
              size="sm"
              variant={viewMode === "list" ? "primary" : "neutral"}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Episode Selector */}
        <div className="mb-8">
          <div className="mb-4 flex items-center gap-2">
            <Eye className="text-base-content/60 h-4 w-4" />
            <span className="text-base-content/60 text-sm font-medium">
              Preview Episode:
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
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
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            {/* Version 1 - Minimal */}
            <div>
              <div className="mb-4">
                <h2 className="text-base-content mb-2 text-xl font-semibold">
                  Version 1: Minimal
                </h2>
                <p className="text-base-content/70 text-sm">
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
                <h2 className="text-base-content mb-2 text-xl font-semibold">
                  Version 2: Visual
                </h2>
                <p className="text-base-content/70 text-sm">
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
                <h2 className="text-base-content mb-2 text-xl font-semibold">
                  Version 3: Compact
                </h2>
                <p className="text-base-content/70 text-sm">
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
                  className="border-base-300 rounded-lg border p-6"
                  key={index}
                >
                  <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    <div className="lg:col-span-1">
                      <h2 className="text-base-content mb-2 text-xl font-semibold">
                        {title}
                      </h2>
                      <p className="text-base-content/70 mb-3 text-sm">
                        {description}
                      </p>
                      <div className="flex flex-wrap gap-1">
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
        <div className="bg-base-200 mt-12 rounded-lg p-6">
          <h3 className="text-base-content mb-3 text-lg font-semibold">
            Design Philosophy
          </h3>
          <div className="grid grid-cols-1 gap-6 text-sm md:grid-cols-3">
            <div>
              <h4 className="text-base-content mb-2 font-medium">
                Minimal (V1)
              </h4>
              <p className="text-base-content/70">
                Prioritizes content readability and clean aesthetics. Uses
                minimal visual elements to keep focus on the episode
                information. Best for users who prefer functionality over form.
              </p>
            </div>
            <div>
              <h4 className="text-base-content mb-2 font-medium">
                Visual (V2)
              </h4>
              <p className="text-base-content/70">
                Emphasizes visual appeal and engagement. Uses gradients, larger
                elements, and rich interactions. Ideal for discovery-focused
                interfaces and visual learners.
              </p>
            </div>
            <div>
              <h4 className="text-base-content mb-2 font-medium">
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
