"use client";

import {
  ArrowDown,
  CheckCircle,
  Clock,
  FileText,
  Globe,
  Mic,
  Upload,
  XCircle,
  Zap,
} from "lucide-react";
import { useEffect, useState } from "react";

import {
  formatTimeRemaining,
  type GenerationStats,
  getStatusColor,
  getStatusLabel,
  type QueueItem,
} from "@/lib/mock-data";

interface QueueStatusV3Props {
  maxVisible?: number;
  queueItems: QueueItem[];
  showDetails?: boolean;
  stats: GenerationStats;
}

const TimelineConnector = ({
  isActive = false,
  isLast = false,
}: {
  isActive?: boolean;
  isLast?: boolean;
}) => {
  if (isLast) return null;

  return (
    <div className="absolute left-6 top-12 w-0.5 h-8 flex items-center justify-center">
      <div
        className={`w-0.5 h-full ${isActive ? "bg-primary animate-pulse" : "bg-base-300"}`}
      />
      {isActive && (
        <ArrowDown className="absolute w-3 h-3 text-primary animate-bounce" />
      )}
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

  return <IconComponent className={`w-4 h-4 ${colorClass}`} />;
};

const MiniProgressBar = ({
  progress,
  status,
}: {
  progress: number;
  status: QueueItem["status"];
}) => {
  const [animatedProgress, setAnimatedProgress] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setAnimatedProgress(progress), 200);
    return () => clearTimeout(timer);
  }, [progress]);

  if (progress === 0) return null;

  return (
    <div className="w-full mt-2">
      <div className="w-full bg-base-300 rounded-full h-1">
        <div
          className={`h-1 rounded-full transition-all duration-1000 ease-out ${
            status === "failed" ? "bg-error" : "bg-primary"
          }`}
          style={{ width: `${animatedProgress}%` }}
        />
      </div>
    </div>
  );
};

export function QueueStatusV3({
  maxVisible = 6,
  queueItems,
  showDetails = true,
  stats,
}: QueueStatusV3Props) {
  const [highlightedItem, setHighlightedItem] = useState<null | string>(null);

  const visibleItems = queueItems.slice(0, maxVisible);
  const remainingCount = Math.max(0, queueItems.length - maxVisible);

  const processingItems = queueItems.filter((item) =>
    ["generating-audio", "scraping", "summarizing", "uploading"].includes(
      item.status
    )
  );

  return (
    <div className="card bg-base-100 border border-base-300 shadow-sm overflow-hidden">
      <div className="card-body p-0">
        {/* Compact Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-primary/5 to-secondary/5 border-b border-base-300">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h3 className="font-bold text-base-content">Queue Timeline</h3>
              <div className="flex items-center gap-1">
                <Zap className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-primary">
                  {processingItems.length} active
                </span>
              </div>
            </div>
            <div className="flex items-center gap-4 text-sm">
              <span className="text-base-content/60">
                {stats.totalInQueue} total
              </span>
              <span className="text-base-content/60">
                ~{formatTimeRemaining(stats.estimatedWaitTime)} wait
              </span>
            </div>
          </div>
        </div>

        {/* Timeline View */}
        <div className="px-6 py-4 max-h-96 overflow-y-auto">
          {visibleItems.length > 0 ? (
            <div className="relative">
              {visibleItems.map((item, index) => {
                const isActive = [
                  "generating-audio",
                  "scraping",
                  "summarizing",
                  "uploading",
                ].includes(item.status);
                const isLast =
                  index === visibleItems.length - 1 && remainingCount === 0;

                return (
                  <div
                    className={`relative transition-all duration-200 ${
                      highlightedItem === item.id ? "scale-105" : ""
                    }`}
                    key={item.id}
                    onMouseEnter={() => setHighlightedItem(item.id)}
                    onMouseLeave={() => setHighlightedItem(null)}
                  >
                    {/* Timeline Node */}
                    <div className="flex items-start gap-4 pb-6">
                      {/* Status Circle */}
                      <div
                        className={`relative z-10 flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all duration-200 ${
                          item.status === "failed"
                            ? "border-error bg-error/10"
                            : item.status === "completed"
                              ? "border-success bg-success/10"
                              : isActive
                                ? "border-primary bg-primary/10 shadow-lg shadow-primary/20"
                                : "border-base-300 bg-base-100"
                        }`}
                      >
                        <StatusIcon status={item.status} />
                        {isActive && (
                          <div className="absolute inset-0 rounded-full border-2 border-primary animate-ping opacity-20" />
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0 pt-1">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-medium text-sm text-base-content truncate">
                            {item.episodeTitle}
                          </h4>
                          <div className="flex items-center gap-2 text-xs">
                            <span className="text-base-content/60">
                              #{item.position + 1}
                            </span>
                            {item.estimatedTimeRemaining &&
                              item.status !== "completed" &&
                              item.status !== "failed" && (
                                <span className="text-primary font-medium">
                                  {formatTimeRemaining(
                                    item.estimatedTimeRemaining
                                  )}
                                </span>
                              )}
                          </div>
                        </div>

                        <div className="flex items-center justify-between mb-2">
                          <p className="text-xs text-base-content/60">
                            {item.sourceName}
                          </p>
                          <span
                            className={`text-xs font-medium ${getStatusColor(item.status)}`}
                          >
                            {getStatusLabel(item.status)}
                          </span>
                        </div>

                        {/* Progress Bar */}
                        <MiniProgressBar
                          progress={item.progress}
                          status={item.status}
                        />

                        {/* Error Message */}
                        {item.status === "failed" && item.errorMessage && (
                          <div className="mt-2 text-xs text-error bg-error/5 px-2 py-1 rounded">
                            {item.errorMessage}
                          </div>
                        )}

                        {/* Cost & Duration for Active Items */}
                        {isActive && showDetails && (
                          <div className="mt-2 flex items-center gap-4 text-xs text-base-content/60">
                            {item.cost && (
                              <span>Cost: ${item.cost.toFixed(3)}</span>
                            )}
                            {item.startedAt && (
                              <span>
                                Started:{" "}
                                {new Date(item.startedAt).toLocaleTimeString()}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Timeline Connector */}
                    <TimelineConnector isActive={isActive} isLast={isLast} />
                  </div>
                );
              })}

              {/* More Items Indicator */}
              {remainingCount > 0 && (
                <div className="relative flex items-center gap-4 text-center">
                  <div className="w-12 h-12 rounded-full border-2 border-dashed border-base-300 flex items-center justify-center">
                    <span className="text-xs text-base-content/60">
                      +{remainingCount}
                    </span>
                  </div>
                  <div className="text-sm text-base-content/60">
                    {remainingCount} more items in queue
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Empty State */
            <div className="text-center py-8">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-base-200 flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-success" />
              </div>
              <h4 className="font-medium text-base-content mb-2">
                Timeline Clear
              </h4>
              <p className="text-sm text-base-content/60">
                No episodes in the generation pipeline
              </p>
            </div>
          )}
        </div>

        {/* Footer Stats */}
        {showDetails && queueItems.length > 0 && (
          <div className="px-6 py-3 bg-base-200/30 border-t border-base-300">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-lg font-bold text-success">
                  {Math.round(stats.successRate * 100)}%
                </div>
                <div className="text-xs text-base-content/60">Success Rate</div>
              </div>
              <div>
                <div className="text-lg font-bold text-primary">
                  {formatTimeRemaining(stats.averageProcessingTime)}
                </div>
                <div className="text-xs text-base-content/60">Avg Time</div>
              </div>
              <div>
                <div className="text-lg font-bold text-base-content">
                  ${stats.totalCostToday.toFixed(2)}
                </div>
                <div className="text-xs text-base-content/60">
                  Today&apos;s Cost
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
