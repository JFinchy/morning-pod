"use client";

import { ArrowLeft, Settings, RefreshCw } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import {
  QueueStatusV1,
  QueueStatusV2,
  QueueStatusV3,
} from "@/components/variants";
import { mockQueueItems, mockGenerationStats } from "@/lib/mock-data";

export default function QueueComparisonPage() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [showDetails, setShowDetails] = useState(true);

  const queueVariants = [
    {
      name: "Progress Bar Queue (V1)",
      component: QueueStatusV1,
      description:
        "Traditional list view with clear progress bars and comprehensive stats",
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
      name: "Dashboard Style (V2)",
      component: QueueStatusV2,
      description:
        "Real-time dashboard with circular progress and live updates",
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
      name: "Timeline View (V3)",
      component: QueueStatusV3,
      description:
        "Timeline-style visualization showing queue flow and progression",
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
    <div className="min-h-screen bg-base-200">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href="/" className="btn btn-ghost btn-sm">
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-base-content">
                Queue Status Variants
              </h1>
              <p className="text-base-content/60 mt-1">
                Compare different approaches to queue monitoring and status
                display
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={handleRefresh} className="btn btn-primary btn-sm">
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
            <div className="form-control">
              <label className="label cursor-pointer gap-2">
                <span className="label-text text-sm">Show Details</span>
                <input
                  type="checkbox"
                  checked={showDetails}
                  onChange={(e) => setShowDetails(e.target.checked)}
                  className="checkbox checkbox-primary checkbox-sm"
                />
              </label>
            </div>
          </div>
        </div>

        {/* Design Philosophy */}
        <div className="card bg-base-100 shadow-sm mb-8">
          <div className="card-body">
            <h2 className="card-title text-primary mb-4">
              Queue Status Design Philosophy
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <h3 className="font-semibold text-base-content mb-2">
                  V1: Traditional Progress
                </h3>
                <p className="text-sm text-base-content/70">
                  Familiar list-based interface with detailed progress bars,
                  comprehensive statistics, and clear error states. Perfect for
                  users who need complete information at a glance.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-base-content mb-2">
                  V2: Real-time Dashboard
                </h3>
                <p className="text-sm text-base-content/70">
                  Modern dashboard approach with live updates, circular progress
                  indicators, and metric cards. Ideal for monitoring systems and
                  administrative interfaces.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-base-content mb-2">
                  V3: Timeline Flow
                </h3>
                <p className="text-sm text-base-content/70">
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
              <div key={`${variant.name}-${refreshKey}`} className="space-y-4">
                {/* Variant Info */}
                <div className="card bg-base-100 shadow-sm">
                  <div className="card-body p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-xl font-bold text-base-content">
                        {variant.name}
                      </h3>
                      <div className="badge badge-primary badge-outline">
                        Variant {index + 1}
                      </div>
                    </div>
                    <p className="text-base-content/70 mb-3">
                      {variant.description}
                    </p>

                    <div className="grid md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <h4 className="font-semibold text-base-content mb-1">
                          Strengths:
                        </h4>
                        <ul className="text-base-content/60 space-y-1">
                          {variant.strengths.map((strength, i) => (
                            <li key={i} className="flex items-center gap-2">
                              <div className="w-1 h-1 bg-primary rounded-full"></div>
                              {strength}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-semibold text-base-content mb-1">
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
                  <div className="card-header p-4 border-b border-base-300">
                    <div className="flex items-center gap-2">
                      <Settings className="w-4 h-4 text-primary" />
                      <span className="font-medium text-base-content">
                        Live Demo
                      </span>
                    </div>
                  </div>
                  <div className="card-body p-4">
                    <ComponentToRender
                      queueItems={mockQueueItems}
                      stats={mockGenerationStats}
                      showDetails={showDetails}
                      maxVisible={index === 2 ? 4 : 5} // V3 shows fewer by default
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Mock Data Info */}
        <div className="card bg-base-100 shadow-sm mt-8">
          <div className="card-body">
            <h3 className="card-title text-base-content mb-4">
              Sample Queue Data
            </h3>
            <div className="grid md:grid-cols-2 gap-6 text-sm">
              <div>
                <h4 className="font-semibold text-base-content mb-2">
                  Queue Items ({mockQueueItems.length})
                </h4>
                <ul className="space-y-1 text-base-content/60">
                  {mockQueueItems.map((item, index) => (
                    <li key={item.id} className="flex items-center gap-2">
                      <span className="font-mono text-xs">#{index + 1}</span>
                      <span className="truncate">{item.episodeTitle}</span>
                      <span
                        className={`text-xs px-1 py-0.5 rounded ${
                          item.status === "failed"
                            ? "bg-error/10 text-error"
                            : item.status === "completed"
                              ? "bg-success/10 text-success"
                              : item.progress > 0
                                ? "bg-primary/10 text-primary"
                                : "bg-base-300 text-base-content/60"
                        }`}
                      >
                        {item.status}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-base-content mb-2">
                  Statistics
                </h4>
                <div className="space-y-1 text-base-content/60">
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
        <div className="flex justify-center mt-8">
          <div className="join">
            <Link
              href="/episodes/comparison"
              className="btn btn-outline join-item"
            >
              Episode Cards
            </Link>
            <Link
              href="/players/comparison"
              className="btn btn-outline join-item"
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
