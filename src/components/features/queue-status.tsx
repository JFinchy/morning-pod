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
      <svg className="transform -rotate-90" height={size} width={size}>
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
        <span className="text-xs font-semibold text-base-content">
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

  return <IconComponent className={`w-5 h-5 ${colorClass}`} />;
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
          <h3 className="text-lg font-semibold text-base-content">
            Queue Status
          </h3>
          <div className="flex items-center gap-2 text-sm text-base-content/60">
            <div className="w-2 h-2 bg-success rounded-full animate-pulse" />
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
                    className={`w-4 h-4 rounded-full border-2 ${
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
                    <div className="w-0.5 h-8 bg-base-300 mt-1" />
                  )}
                </div>

                {/* Item content */}
                <div className="flex-1 min-w-0 pb-2">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium text-sm text-base-content truncate">
                      {item.episodeTitle}
                    </h4>
                    {isActive && (
                      <div className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                        {Math.round(item.progress)}%
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-base-content/60 mb-1">
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
          <div className="text-center py-2 text-sm text-base-content/60">
            + {remainingCount} more items
          </div>
        )}

        {queueItems.length === 0 && (
          <div className="text-center py-8">
            <CheckCircle className="w-8 h-8 mx-auto mb-2 text-success" />
            <p className="text-sm text-base-content/60">Queue is empty</p>
          </div>
        )}
      </div>
    );
  }

  // Default dashboard variant
  return (
    <div className="card bg-gradient-to-br from-base-100 to-base-200/50 border border-base-300 shadow-lg">
      <div className="card-body p-6">
        {/* Header with Real-time Badge */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <h3 className="text-xl font-bold text-base-content">
              Processing Queue
            </h3>
            <div className="flex items-center gap-1 px-2 py-1 bg-success/10 rounded-full">
              <div className="w-2 h-2 bg-success rounded-full animate-pulse" />
              <span className="text-xs text-success font-medium">Live</span>
            </div>
          </div>
          <div className="text-sm text-base-content/60">
            {currentTime.toLocaleTimeString()}
          </div>
        </div>

        {/* Key Metrics Dashboard */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
          {/* Processing Status */}
          <div className="flex items-center gap-4 p-4 bg-primary/5 rounded-xl border border-primary/20">
            <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-primary" />
            </div>
            <div>
              <div className="text-2xl font-bold text-primary">
                {stats.currentlyProcessing}
              </div>
              <div className="text-xs text-base-content/60">Processing Now</div>
            </div>
          </div>

          {/* Queue Length */}
          <div className="flex items-center gap-4 p-4 bg-warning/5 rounded-xl border border-warning/20">
            <div className="w-12 h-12 bg-warning/20 rounded-full flex items-center justify-center">
              <Clock className="w-6 h-6 text-warning" />
            </div>
            <div>
              <div className="text-2xl font-bold text-warning">
                {stats.totalInQueue}
              </div>
              <div className="text-xs text-base-content/60">In Queue</div>
            </div>
          </div>

          {/* Success Rate */}
          <div className="flex items-center gap-4 p-4 bg-success/5 rounded-xl border border-success/20">
            <div className="w-12 h-12 bg-success/20 rounded-full flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-success" />
            </div>
            <div>
              <div className="text-2xl font-bold text-success">
                {Math.round(stats.successRate * 100)}%
              </div>
              <div className="text-xs text-base-content/60">Success Rate</div>
            </div>
          </div>
        </div>

        {/* Active Processing Items */}
        {activeItems.length > 0 && (
          <div className="mb-6">
            <h4 className="font-semibold text-base-content mb-4 flex items-center gap-2">
              <div className="w-3 h-3 bg-primary rounded-full animate-pulse" />
              Currently Processing
            </h4>
            <div className="grid gap-4">
              {activeItems.map((item) => (
                <div
                  className="flex items-center gap-4 p-4 bg-primary/5 rounded-xl border border-primary/20"
                  key={item.id}
                >
                  <CircularProgress
                    progress={item.progress}
                    size={70}
                    status={item.status}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <StatusIcon status={item.status} />
                      <h5 className="font-medium text-base-content truncate">
                        {item.episodeTitle}
                      </h5>
                    </div>
                    <p className="text-sm text-base-content/60 mb-1">
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
            <h4 className="font-semibold text-base-content mb-4">
              Upcoming in Queue
            </h4>
            <div className="space-y-2">
              {visibleItems
                .filter((item) => !activeItems.includes(item))
                .map((item, index) => (
                  <div
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-base-200/50 transition-colors"
                    key={item.id}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-base-content/40 w-6">
                        #{index + 1}
                      </span>
                      <StatusIcon status={item.status} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h6 className="font-medium text-sm text-base-content truncate">
                        {item.episodeTitle}
                      </h6>
                      <p className="text-xs text-base-content/60">
                        {item.sourceName}
                      </p>
                    </div>
                    <div className="text-right">
                      {item.estimatedTimeRemaining && (
                        <div className="text-xs text-base-content/60">
                          ~{formatTimeRemaining(item.estimatedTimeRemaining)}
                        </div>
                      )}
                      {item.status === "failed" && (
                        <div className="text-xs text-error">Failed</div>
                      )}
                    </div>
                  </div>
                ))}

              {remainingCount > 0 && (
                <div className="text-center py-2 text-sm text-base-content/60">
                  + {remainingCount} more items
                </div>
              )}
            </div>
          </div>
        )}

        {/* Empty State */}
        {queueItems.length === 0 && (
          <div className="text-center py-12">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-base-200 flex items-center justify-center">
              <CheckCircle className="w-10 h-10 text-success" />
            </div>
            <h4 className="text-lg font-semibold text-base-content mb-2">
              All Caught Up!
            </h4>
            <p className="text-base-content/60">
              No episodes in the generation queue right now
            </p>
          </div>
        )}

        {/* Performance Footer */}
        {showDetails && (
          <div className="mt-6 pt-4 border-t border-base-300 flex justify-between text-xs text-base-content/60">
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
