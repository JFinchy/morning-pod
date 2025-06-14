"use client";

import {
  QueueStatusV1,
  QueueStatusV2,
  QueueStatusV3,
} from "@/components/internal/variants";
import { mockGenerationStats, mockQueueItems } from "@/lib/mock-data/queue";

export default function QueueStatusShowcase() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-base-content mb-2 text-3xl font-bold">
          Queue Status Variants
        </h1>
        <p className="text-base-content/60 mx-auto max-w-2xl">
          Compare different queue monitoring designs for episode generation
          processing.
        </p>
      </div>

      {/* Queue Variants */}
      <div className="space-y-8">
        <div className="space-y-4">
          <h3 className="text-base-content text-xl font-semibold">
            V1: Progress Bar Layout
          </h3>
          <QueueStatusV1
            queueItems={mockQueueItems}
            stats={mockGenerationStats}
          />
        </div>

        <div className="space-y-4">
          <h3 className="text-base-content text-xl font-semibold">
            V2: Real-time Dashboard
          </h3>
          <QueueStatusV2
            queueItems={mockQueueItems}
            stats={mockGenerationStats}
          />
        </div>

        <div className="space-y-4">
          <h3 className="text-base-content text-xl font-semibold">
            V3: Timeline Visualization
          </h3>
          <QueueStatusV3
            queueItems={mockQueueItems}
            stats={mockGenerationStats}
          />
        </div>
      </div>
    </div>
  );
}
