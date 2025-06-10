"use client";

import { ArrowLeft, RefreshCw, Settings } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import {
  QueueStatusV1,
  QueueStatusV2,
  QueueStatusV3,
} from "@/components/internal/variants";
import { mockGenerationStats, mockQueueItems } from "@/lib/mock-data";

export default function QueueComparisonPage() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [showDetails, setShowDetails] = useState(true);

  const queueVariants = [
    {
      component: QueueStatusV1,
      description:
        "Traditional list view with clear progress bars and comprehensive stats",
      name: "Progress Bar Queue (V1)",
      strengths: [
        "Clear progress visualization",
        "Detailed queue statistics",
        "Error handling",
        "Familiar interface",
      ],
      useCase:
        "Users who need detailed monitoring and prefer traditional list layouts",
    },
    {
      component: QueueStatusV2,
      description:
        "Real-time dashboard with circular progress and live updates",
      name: "Dashboard Style (V2)",
      strengths: [
        "Real-time updates",
        "Circular progress rings",
        "Visual metric cards",
        "Professional dashboard feel",
      ],
      useCase:
        "Power users and administrators who need comprehensive monitoring",
    },
    {
      component: QueueStatusV3,
      description:
        "Timeline-style visualization showing queue flow and progression",
      name: "Timeline View (V3)",
      strengths: [
        "Timeline visualization",
        "Interactive hover effects",
        "Compact display",
        "Process flow clarity",
      ],
      useCase:
        "Users who prefer visual process flows and timeline representations",
    },
  ];

  const handleRefresh = () => {
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <div className="bg-base-200 min-h-screen">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link className="btn btn-ghost btn-sm" href="/">
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Link>
            <div>
              <h1 className="text-base-content text-3xl font-bold">
                Queue Status Variants
              </h1>
              <p className="text-base-content/60 mt-1">
                Compare different approaches to queue monitoring and status
                display
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="btn btn-primary btn-sm" onClick={handleRefresh}>
              <RefreshCw className="h-4 w-4" />
              Refresh
            </button>
            <div className="form-control">
              <label className="label cursor-pointer gap-2">
                <span className="label-text text-sm">Show Details</span>
                <input
                  checked={showDetails}
                  className="checkbox checkbox-primary checkbox-sm"
                  onChange={(e) => setShowDetails(e.target.checked)}
                  type="checkbox"
                />
              </label>
            </div>
          </div>
        </div>

        {/* Design Philosophy */}
        <div className="card bg-base-100 mb-8 shadow-sm">
          <div className="card-body">
            <h2 className="card-title text-primary mb-4">
              Queue Status Design Philosophy
            </h2>
            <div className="grid gap-6 md:grid-cols-3">
              <div>
                <h3 className="text-base-content mb-2 font-semibold">
                  V1: Traditional Progress
                </h3>
                <p className="text-base-content/70 text-sm">
                  Familiar list-based interface with detailed progress bars,
                  comprehensive statistics, and clear error states. Perfect for
                  users who need complete information at a glance.
                </p>
              </div>
              <div>
                <h3 className="text-base-content mb-2 font-semibold">
                  V2: Real-time Dashboard
                </h3>
                <p className="text-base-content/70 text-sm">
                  Modern dashboard approach with live updates, circular progress
                  indicators, and metric cards. Ideal for monitoring systems and
                  administrative interfaces.
                </p>
              </div>
              <div>
                <h3 className="text-base-content mb-2 font-semibold">
                  V3: Timeline Flow
                </h3>
                <p className="text-base-content/70 text-sm">
                  Visual timeline showing queue progression with interactive
                  elements and compact display. Great for understanding process
                  flow and current pipeline status.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Variant Comparison */}
        <div className="grid gap-8">
          {queueVariants.map((variant, index) => {
            const ComponentToRender = variant.component;

            return (
              <div className="space-y-4" key={`${variant.name}-${refreshKey}`}>
                {/* Variant Info */}
                <div className="card bg-base-100 shadow-sm">
                  <div className="card-body p-4">
                    <div className="mb-3 flex items-center justify-between">
                      <h3 className="text-base-content text-xl font-bold">
                        {variant.name}
                      </h3>
                      <div className="badge badge-primary badge-outline">
                        Variant {index + 1}
                      </div>
                    </div>
                    <p className="text-base-content/70 mb-3">
                      {variant.description}
                    </p>

                    <div className="grid gap-4 text-sm md:grid-cols-2">
                      <div>
                        <h4 className="text-base-content mb-1 font-semibold">
                          Strengths:
                        </h4>
                        <ul className="text-base-content/60 space-y-1">
                          {variant.strengths.map((strength, i) => (
                            <li className="flex items-center gap-2" key={i}>
                              <div className="bg-primary h-1 w-1 rounded-full" />
                              {strength}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h4 className="text-base-content mb-1 font-semibold">
                          Best For:
                        </h4>
                        <p className="text-base-content/60">
                          {variant.useCase}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Component Demo */}
                <div className="card bg-base-100 shadow-sm">
                  <div className="card-header border-base-300 border-b p-4">
                    <div className="flex items-center gap-2">
                      <Settings className="text-primary h-4 w-4" />
                      <span className="text-base-content font-medium">
                        Live Demo
                      </span>
                    </div>
                  </div>
                  <div className="card-body p-4">
                    <ComponentToRender
                      maxVisible={index === 2 ? 4 : 5} // V3 shows fewer by default
                      queueItems={mockQueueItems}
                      showDetails={showDetails}
                      stats={mockGenerationStats}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Mock Data Info */}
        <div className="card bg-base-100 mt-8 shadow-sm">
          <div className="card-body">
            <h3 className="card-title text-base-content mb-4">
              Sample Queue Data
            </h3>
            <div className="grid gap-6 text-sm md:grid-cols-2">
              <div>
                <h4 className="text-base-content mb-2 font-semibold">
                  Queue Items ({mockQueueItems.length})
                </h4>
                <ul className="text-base-content/60 space-y-1">
                  {mockQueueItems.map((item, index) => (
                    <li className="flex items-center gap-2" key={item.id}>
                      <span className="font-mono text-xs">#{index + 1}</span>
                      <span className="truncate">{item.episodeTitle}</span>
                      <span
                        className={`rounded px-1 py-0.5 text-xs ${(() => {
                          if (item.status === "failed")
                            return "bg-error/10 text-error";
                          if (item.status === "completed")
                            return "bg-success/10 text-success";
                          if (item.progress > 0)
                            return "bg-primary/10 text-primary";
                          return "bg-base-300 text-base-content/60";
                        })()}`}
                      >
                        {item.status}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="text-base-content mb-2 font-semibold">
                  Statistics
                </h4>
                <div className="text-base-content/60 space-y-1">
                  <div>Total in Queue: {mockGenerationStats.totalInQueue}</div>
                  <div>
                    Currently Processing:{" "}
                    {mockGenerationStats.currentlyProcessing}
                  </div>
                  <div>
                    Success Rate:{" "}
                    {Math.round(mockGenerationStats.successRate * 100)}%
                  </div>
                  <div>
                    Estimated Wait: ~
                    {Math.round(mockGenerationStats.estimatedWaitTime / 60)}{" "}
                    minutes
                  </div>
                  <div>
                    Today&apos;s Cost: $
                    {mockGenerationStats.totalCostToday.toFixed(2)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Footer */}
        <div className="mt-8 flex justify-center">
          <div className="join">
            <Link
              className="btn btn-outline join-item"
              href="/episodes/comparison"
            >
              Episode Cards
            </Link>
            <Link
              className="btn btn-outline join-item"
              href="/players/comparison"
            >
              Audio Players
            </Link>
            <span className="btn btn-primary join-item">Queue Status</span>
          </div>
        </div>
      </div>
    </div>
  );
}
