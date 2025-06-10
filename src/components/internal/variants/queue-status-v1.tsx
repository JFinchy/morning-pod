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

  return <IconComponent className={`w-4 h-4 ${colorClass}`} />;
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
    <div className="card bg-base-100 border border-base-300 shadow-sm">
      <div className="card-body p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-base-content">
            Generation Queue
          </h3>
          <div className="badge badge-primary badge-outline">
            {stats.totalInQueue} items
          </div>
        </div>

        {/* Queue Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="stat p-3 bg-base-200/50 rounded-lg">
            <div className="stat-title text-xs">Processing</div>
            <div className="stat-value text-lg text-primary">
              {stats.currentlyProcessing}
            </div>
          </div>
          <div className="stat p-3 bg-base-200/50 rounded-lg">
            <div className="stat-title text-xs">Est. Wait</div>
            <div className="stat-value text-lg">
              {formatTimeRemaining(stats.estimatedWaitTime)}
            </div>
          </div>
          <div className="stat p-3 bg-base-200/50 rounded-lg">
            <div className="stat-title text-xs">Success Rate</div>
            <div className="stat-value text-lg text-success">
              {Math.round(stats.successRate * 100)}%
            </div>
          </div>
          <div className="stat p-3 bg-base-200/50 rounded-lg">
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
              className={`p-4 rounded-lg border transition-all duration-300 ${
                item.status === "failed"
                  ? "border-error/30 bg-error/5"
                  : item.progress > 0
                    ? "border-primary/30 bg-primary/5"
                    : "border-base-300 bg-base-100"
              }`}
              key={item.id}
            >
              {/* Item Header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-base-content/60">
                      #{index + 1}
                    </span>
                    <StatusIcon status={item.status} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm text-base-content truncate">
                      {item.episodeTitle}
                    </h4>
                    <p className="text-xs text-base-content/60">
                      {item.sourceName}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-base-content/60">
                    {getStatusLabel(item.status)}
                  </div>
                  {item.estimatedTimeRemaining &&
                    item.status !== "completed" &&
                    item.status !== "failed" && (
                      <div className="text-xs text-primary">
                        {formatTimeRemaining(item.estimatedTimeRemaining)} left
                      </div>
                    )}
                </div>
              </div>

              {/* Progress Bar */}
              {item.progress > 0 && item.status !== "completed" && (
                <div className="mb-2">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-base-content/60">Progress</span>
                    <span className="text-base-content">{item.progress}%</span>
                  </div>
                  <div className="w-full bg-base-300 rounded-full h-2">
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
                <div className="mt-2 p-2 bg-error/10 rounded text-xs text-error">
                  {item.errorMessage}
                </div>
              )}

              {/* Cost Display */}
              {item.cost && showDetails && (
                <div className="mt-2 text-xs text-base-content/60">
                  Cost: ${item.cost.toFixed(3)}
                </div>
              )}
            </div>
          ))}

          {/* Remaining Items Indicator */}
          {remainingCount > 0 && (
            <div className="text-center py-2">
              <span className="text-sm text-base-content/60">
                + {remainingCount} more items in queue
              </span>
            </div>
          )}

          {/* Empty State */}
          {queueItems.length === 0 && (
            <div className="text-center py-8">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-base-200 flex items-center justify-center">
                <Clock className="w-8 h-8 text-base-content/40" />
              </div>
              <h4 className="font-medium text-base-content mb-2">
                Queue is empty
              </h4>
              <p className="text-sm text-base-content/60">
                New episodes will appear here when generation starts
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
