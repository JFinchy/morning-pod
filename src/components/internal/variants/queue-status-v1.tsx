"use client";

import {
  CheckCircle,
  Clock,
  FileText,
  Globe,
  Mic,
  Upload,
  XCircle,
} from "lucide-react";
import { useEffect, useState } from "react";

import {
  formatTimeRemaining,
  type GenerationStats,
  getStatusColor,
  getStatusLabel,
  type QueueItem,
} from "@/lib/mock-data";

interface QueueStatusV1Props {
  maxVisible?: number;
  queueItems: QueueItem[];
  showDetails?: boolean;
  stats: GenerationStats;
}

const StatusIcon = ({ status }: { status: QueueItem["status"] }) => {
  const iconMap = {
    completed: CheckCircle,
    failed: XCircle,
    "generating-audio": Mic,
    pending: Clock,
    scraping: Globe,
    summarizing: FileText,
    uploading: Upload,
  };

  const IconComponent = iconMap[status];
  const colorClass = getStatusColor(status);

  return <IconComponent className={`h-4 w-4 ${colorClass}`} />;
};

export function QueueStatusV1({
  maxVisible = 5,
  queueItems,
  showDetails = true,
  stats,
}: QueueStatusV1Props) {
  const [animatedProgress, setAnimatedProgress] = useState<
    Record<string, number>
  >({});

  // Animate progress bars
  useEffect(() => {
    const newProgress: Record<string, number> = {};
    for (const item of queueItems) {
      newProgress[item.id] = 0;
    }
    setAnimatedProgress(newProgress);

    const timer = setTimeout(() => {
      const finalProgress: Record<string, number> = {};
      for (const item of queueItems) {
        finalProgress[item.id] = item.progress;
      }
      setAnimatedProgress(finalProgress);
    }, 100);

    return () => clearTimeout(timer);
  }, [queueItems]);

  // TODO: Use activeItems and pendingItems for separate sections
  // const activeItems = queueItems.filter((item) =>
  //   ["scraping", "summarizing", "generating-audio", "uploading"].includes(
  //     item.status
  //   )
  // );

  // const pendingItems = queueItems.filter((item) => item.status === "pending");
  const visibleItems = queueItems.slice(0, maxVisible);
  const remainingCount = Math.max(0, queueItems.length - maxVisible);

  return (
    <div className="card bg-base-100 border-base-300 border shadow-sm">
      <div className="card-body p-6">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-base-content text-lg font-semibold">
            Generation Queue
          </h3>
          <div className="badge badge-primary badge-outline">
            {stats.totalInQueue} items
          </div>
        </div>

        {/* Queue Stats */}
        <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
          <div className="stat bg-base-200/50 rounded-lg p-3">
            <div className="stat-title text-xs">Processing</div>
            <div className="stat-value text-primary text-lg">
              {stats.currentlyProcessing}
            </div>
          </div>
          <div className="stat bg-base-200/50 rounded-lg p-3">
            <div className="stat-title text-xs">Est. Wait</div>
            <div className="stat-value text-lg">
              {formatTimeRemaining(stats.estimatedWaitTime)}
            </div>
          </div>
          <div className="stat bg-base-200/50 rounded-lg p-3">
            <div className="stat-title text-xs">Success Rate</div>
            <div className="stat-value text-success text-lg">
              {Math.round(stats.successRate * 100)}%
            </div>
          </div>
          <div className="stat bg-base-200/50 rounded-lg p-3">
            <div className="stat-title text-xs">Cost Today</div>
            <div className="stat-value text-lg">
              ${stats.totalCostToday.toFixed(2)}
            </div>
          </div>
        </div>

        {/* Queue Items */}
        <div className="space-y-3">
          {visibleItems.map((item, index) => (
            <div
              className={`rounded-lg border p-4 transition-all duration-300 ${
                item.status === "failed"
                  ? "border-error/30 bg-error/5"
                  : item.progress > 0
                    ? "border-primary/30 bg-primary/5"
                    : "border-base-300 bg-base-100"
              }`}
              key={item.id}
            >
              {/* Item Header */}
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-base-content/60 font-mono text-xs">
                      #{index + 1}
                    </span>
                    <StatusIcon status={item.status} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="text-base-content truncate text-sm font-medium">
                      {item.episodeTitle}
                    </h4>
                    <p className="text-base-content/60 text-xs">
                      {item.sourceName}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-base-content/60 text-xs">
                    {getStatusLabel(item.status)}
                  </div>
                  {item.estimatedTimeRemaining &&
                    item.status !== "completed" &&
                    item.status !== "failed" && (
                      <div className="text-primary text-xs">
                        {formatTimeRemaining(item.estimatedTimeRemaining)} left
                      </div>
                    )}
                </div>
              </div>

              {/* Progress Bar */}
              {item.progress > 0 && item.status !== "completed" && (
                <div className="mb-2">
                  <div className="mb-1 flex justify-between text-xs">
                    <span className="text-base-content/60">Progress</span>
                    <span className="text-base-content">{item.progress}%</span>
                  </div>
                  <div className="bg-base-300 h-2 w-full rounded-full">
                    <div
                      className={`h-2 rounded-full transition-all duration-1000 ease-out ${
                        item.status === "failed" ? "bg-error" : "bg-primary"
                      }`}
                      style={{ width: `${animatedProgress[item.id] || 0}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Error Message */}
              {item.status === "failed" && item.errorMessage && (
                <div className="bg-error/10 text-error mt-2 rounded p-2 text-xs">
                  {item.errorMessage}
                </div>
              )}

              {/* Cost Display */}
              {item.cost && showDetails && (
                <div className="text-base-content/60 mt-2 text-xs">
                  Cost: ${item.cost.toFixed(3)}
                </div>
              )}
            </div>
          ))}

          {/* Remaining Items Indicator */}
          {remainingCount > 0 && (
            <div className="py-2 text-center">
              <span className="text-base-content/60 text-sm">
                + {remainingCount} more items in queue
              </span>
            </div>
          )}

          {/* Empty State */}
          {queueItems.length === 0 && (
            <div className="py-8 text-center">
              <div className="bg-base-200 mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full">
                <Clock className="text-base-content/40 h-8 w-8" />
              </div>
              <h4 className="text-base-content mb-2 font-medium">
                Queue is empty
              </h4>
              <p className="text-base-content/60 text-sm">
                New episodes will appear here when generation starts
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
