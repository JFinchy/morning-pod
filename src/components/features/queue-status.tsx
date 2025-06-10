"use client";

import {
  CheckCircle,
  Clock,
  FileText,
  Globe,
  Mic,
  TrendingUp,
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

interface QueueStatusProps {
  maxVisible?: number;
  queueItems: QueueItem[];
  showDetails?: boolean;
  stats: GenerationStats;
  variant?: "dashboard" | "timeline";
}

const CircularProgress = ({
  progress,
  size = 60,
  status = "pending",
  strokeWidth = 4,
}: {
  progress: number;
  size?: number;
  status?: QueueItem["status"];
  strokeWidth?: number;
}) => {
  const [animatedProgress, setAnimatedProgress] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setAnimatedProgress(progress), 100);
    return () => clearTimeout(timer);
  }, [progress]);

  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (animatedProgress / 100) * circumference;

  const getStrokeColor = () => {
    if (status === "failed") return "#ef4444"; // error color
    if (status === "completed") return "#22c55e"; // success color
    return "#3b82f6"; // primary color
  };

  return (
    <div className="relative flex items-center justify-center">
      <svg className="-rotate-90 transform" height={size} width={size}>
        {/* Background circle */}
        <circle
          className="text-base-300"
          cx={size / 2}
          cy={size / 2}
          fill="none"
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
        />
        {/* Progress circle */}
        <circle
          className="transition-all duration-1000 ease-out"
          cx={size / 2}
          cy={size / 2}
          fill="none"
          r={radius}
          stroke={getStrokeColor()}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          strokeWidth={strokeWidth}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-base-content text-xs font-semibold">
          {progress}%
        </span>
      </div>
    </div>
  );
};

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

  return <IconComponent className={`h-5 w-5 ${colorClass}`} />;
};

export function QueueStatus({
  maxVisible = 4,
  queueItems,
  showDetails = true,
  stats,
  variant = "dashboard",
}: QueueStatusProps) {
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update time every second for real-time feel
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const activeItems = queueItems.filter((item) =>
    ["generating-audio", "scraping", "summarizing", "uploading"].includes(
      item.status
    )
  );

  const visibleItems = queueItems.slice(0, maxVisible);
  const remainingCount = Math.max(0, queueItems.length - maxVisible);

  // Timeline variant - vertical flow
  if (variant === "timeline") {
    return (
      <div className="space-y-4">
        {/* Compact Header */}
        <div className="flex items-center justify-between">
          <h3 className="text-base-content text-lg font-semibold">
            Queue Status
          </h3>
          <div className="text-base-content/60 flex items-center gap-2 text-sm">
            <div className="bg-success h-2 w-2 animate-pulse rounded-full" />
            {stats.currentlyProcessing} processing
          </div>
        </div>

        {/* Timeline Items */}
        <div className="space-y-3">
          {visibleItems.map((item, index) => {
            const isActive = activeItems.includes(item);
            return (
              <div className="flex items-start gap-3" key={item.id}>
                {/* Timeline indicator */}
                <div className="flex flex-col items-center">
                  <div
                    className={`h-4 w-4 rounded-full border-2 ${
                      isActive
                        ? "bg-primary border-primary"
                        : item.status === "completed"
                          ? "bg-success border-success"
                          : item.status === "failed"
                            ? "bg-error border-error"
                            : "bg-base-300 border-base-300"
                    }`}
                  />
                  {index < visibleItems.length - 1 && (
                    <div className="bg-base-300 mt-1 h-8 w-0.5" />
                  )}
                </div>

                {/* Item content */}
                <div className="min-w-0 flex-1 pb-2">
                  <div className="mb-1 flex items-center gap-2">
                    <h4 className="text-base-content truncate text-sm font-medium">
                      {item.episodeTitle}
                    </h4>
                    {isActive && (
                      <div className="bg-primary/10 text-primary rounded-full px-2 py-0.5 text-xs">
                        {Math.round(item.progress)}%
                      </div>
                    )}
                  </div>
                  <p className="text-base-content/60 mb-1 text-xs">
                    {item.sourceName}
                  </p>
                  <div className="flex items-center gap-2 text-xs">
                    <span
                      className={`font-medium ${
                        isActive
                          ? "text-primary"
                          : item.status === "completed"
                            ? "text-success"
                            : item.status === "failed"
                              ? "text-error"
                              : "text-base-content/60"
                      }`}
                    >
                      {getStatusLabel(item.status)}
                    </span>
                    {item.estimatedTimeRemaining && (
                      <span className="text-base-content/50">
                        {formatTimeRemaining(item.estimatedTimeRemaining)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {remainingCount > 0 && (
          <div className="text-base-content/60 py-2 text-center text-sm">
            + {remainingCount} more items
          </div>
        )}

        {queueItems.length === 0 && (
          <div className="py-8 text-center">
            <CheckCircle className="text-success mx-auto mb-2 h-8 w-8" />
            <p className="text-base-content/60 text-sm">Queue is empty</p>
          </div>
        )}
      </div>
    );
  }

  // Default dashboard variant
  return (
    <div className="card from-base-100 to-base-200/50 border-base-300 border bg-gradient-to-br shadow-lg">
      <div className="card-body p-6">
        {/* Header with Real-time Badge */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h3 className="text-base-content text-xl font-bold">
              Processing Queue
            </h3>
            <div className="bg-success/10 flex items-center gap-1 rounded-full px-2 py-1">
              <div className="bg-success h-2 w-2 animate-pulse rounded-full" />
              <span className="text-success text-xs font-medium">Live</span>
            </div>
          </div>
          <div className="text-base-content/60 text-sm">
            {currentTime.toLocaleTimeString()}
          </div>
        </div>

        {/* Key Metrics Dashboard */}
        <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-3">
          {/* Processing Status */}
          <div className="bg-primary/5 border-primary/20 flex items-center gap-4 rounded-xl border p-4">
            <div className="bg-primary/20 flex h-12 w-12 items-center justify-center rounded-full">
              <TrendingUp className="text-primary h-6 w-6" />
            </div>
            <div>
              <div className="text-primary text-2xl font-bold">
                {stats.currentlyProcessing}
              </div>
              <div className="text-base-content/60 text-xs">Processing Now</div>
            </div>
          </div>

          {/* Queue Length */}
          <div className="bg-warning/5 border-warning/20 flex items-center gap-4 rounded-xl border p-4">
            <div className="bg-warning/20 flex h-12 w-12 items-center justify-center rounded-full">
              <Clock className="text-warning h-6 w-6" />
            </div>
            <div>
              <div className="text-warning text-2xl font-bold">
                {stats.totalInQueue}
              </div>
              <div className="text-base-content/60 text-xs">In Queue</div>
            </div>
          </div>

          {/* Success Rate */}
          <div className="bg-success/5 border-success/20 flex items-center gap-4 rounded-xl border p-4">
            <div className="bg-success/20 flex h-12 w-12 items-center justify-center rounded-full">
              <CheckCircle className="text-success h-6 w-6" />
            </div>
            <div>
              <div className="text-success text-2xl font-bold">
                {Math.round(stats.successRate * 100)}%
              </div>
              <div className="text-base-content/60 text-xs">Success Rate</div>
            </div>
          </div>
        </div>

        {/* Active Processing Items */}
        {activeItems.length > 0 && (
          <div className="mb-6">
            <h4 className="text-base-content mb-4 flex items-center gap-2 font-semibold">
              <div className="bg-primary h-3 w-3 animate-pulse rounded-full" />
              Currently Processing
            </h4>
            <div className="grid gap-4">
              {activeItems.map((item) => (
                <div
                  className="bg-primary/5 border-primary/20 flex items-center gap-4 rounded-xl border p-4"
                  key={item.id}
                >
                  <CircularProgress
                    progress={item.progress}
                    size={70}
                    status={item.status}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="mb-1 flex items-center gap-2">
                      <StatusIcon status={item.status} />
                      <h5 className="text-base-content truncate font-medium">
                        {item.episodeTitle}
                      </h5>
                    </div>
                    <p className="text-base-content/60 mb-1 text-sm">
                      {item.sourceName}
                    </p>
                    <div className="flex items-center gap-4 text-xs">
                      <span className="text-primary font-medium">
                        {getStatusLabel(item.status)}
                      </span>
                      {item.estimatedTimeRemaining && (
                        <span className="text-base-content/60">
                          {formatTimeRemaining(item.estimatedTimeRemaining)}{" "}
                          remaining
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Queue Preview */}
        {queueItems.length > activeItems.length && (
          <div>
            <h4 className="text-base-content mb-4 font-semibold">
              Upcoming in Queue
            </h4>
            <div className="space-y-2">
              {visibleItems
                .filter((item) => !activeItems.includes(item))
                .map((item, index) => (
                  <div
                    className="hover:bg-base-200/50 flex items-center gap-3 rounded-lg p-3 transition-colors"
                    key={item.id}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-base-content/40 w-6 font-mono text-xs">
                        #{index + 1}
                      </span>
                      <StatusIcon status={item.status} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h6 className="text-base-content truncate text-sm font-medium">
                        {item.episodeTitle}
                      </h6>
                      <p className="text-base-content/60 text-xs">
                        {item.sourceName}
                      </p>
                    </div>
                    <div className="text-right">
                      {item.estimatedTimeRemaining && (
                        <div className="text-base-content/60 text-xs">
                          ~{formatTimeRemaining(item.estimatedTimeRemaining)}
                        </div>
                      )}
                      {item.status === "failed" && (
                        <div className="text-error text-xs">Failed</div>
                      )}
                    </div>
                  </div>
                ))}

              {remainingCount > 0 && (
                <div className="text-base-content/60 py-2 text-center text-sm">
                  + {remainingCount} more items
                </div>
              )}
            </div>
          </div>
        )}

        {/* Empty State */}
        {queueItems.length === 0 && (
          <div className="py-12 text-center">
            <div className="bg-base-200 mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full">
              <CheckCircle className="text-success h-10 w-10" />
            </div>
            <h4 className="text-base-content mb-2 text-lg font-semibold">
              All Caught Up!
            </h4>
            <p className="text-base-content/60">
              No episodes in the generation queue right now
            </p>
          </div>
        )}

        {/* Performance Footer */}
        {showDetails && (
          <div className="border-base-300 text-base-content/60 mt-6 flex justify-between border-t pt-4 text-xs">
            <span>
              Avg processing: {formatTimeRemaining(stats.averageProcessingTime)}
            </span>
            <span>Today&apos;s cost: ${stats.totalCostToday.toFixed(2)}</span>
          </div>
        )}
      </div>
    </div>
  );
}
