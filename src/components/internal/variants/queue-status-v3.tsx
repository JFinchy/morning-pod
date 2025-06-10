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
    <div className="absolute top-12 left-6 flex h-8 w-0.5 items-center justify-center">
      <div
        className={`h-full w-0.5 ${isActive ? "bg-primary animate-pulse" : "bg-base-300"}`}
      />
      {isActive && (
        <ArrowDown className="text-primary absolute h-3 w-3 animate-bounce" />
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

  return <IconComponent className={`h-4 w-4 ${colorClass}`} />;
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
    <div className="mt-2 w-full">
      <div className="bg-base-300 h-1 w-full rounded-full">
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
    <div className="card bg-base-100 border-base-300 overflow-hidden border shadow-sm">
      <div className="card-body p-0">
        {/* Compact Header */}
        <div className="from-primary/5 to-secondary/5 border-base-300 border-b bg-gradient-to-r px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h3 className="text-base-content font-bold">Queue Timeline</h3>
              <div className="flex items-center gap-1">
                <Zap className="text-primary h-4 w-4" />
                <span className="text-primary text-sm font-medium">
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
        <div className="max-h-96 overflow-y-auto px-6 py-4">
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
                        className={`relative z-10 flex h-12 w-12 items-center justify-center rounded-full border-2 transition-all duration-200 ${
                          item.status === "failed"
                            ? "border-error bg-error/10"
                            : item.status === "completed"
                              ? "border-success bg-success/10"
                              : isActive
                                ? "border-primary bg-primary/10 shadow-primary/20 shadow-lg"
                                : "border-base-300 bg-base-100"
                        }`}
                      >
                        <StatusIcon status={item.status} />
                        {isActive && (
                          <div className="border-primary absolute inset-0 animate-ping rounded-full border-2 opacity-20" />
                        )}
                      </div>

                      {/* Content */}
                      <div className="min-w-0 flex-1 pt-1">
                        <div className="mb-1 flex items-center justify-between">
                          <h4 className="text-base-content truncate text-sm font-medium">
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

                        <div className="mb-2 flex items-center justify-between">
                          <p className="text-base-content/60 text-xs">
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
                          <div className="text-error bg-error/5 mt-2 rounded px-2 py-1 text-xs">
                            {item.errorMessage}
                          </div>
                        )}

                        {/* Cost & Duration for Active Items */}
                        {isActive && showDetails && (
                          <div className="text-base-content/60 mt-2 flex items-center gap-4 text-xs">
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
                  <div className="border-base-300 flex h-12 w-12 items-center justify-center rounded-full border-2 border-dashed">
                    <span className="text-base-content/60 text-xs">
                      +{remainingCount}
                    </span>
                  </div>
                  <div className="text-base-content/60 text-sm">
                    {remainingCount} more items in queue
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Empty State */
            <div className="py-8 text-center">
              <div className="bg-base-200 mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full">
                <CheckCircle className="text-success h-8 w-8" />
              </div>
              <h4 className="text-base-content mb-2 font-medium">
                Timeline Clear
              </h4>
              <p className="text-base-content/60 text-sm">
                No episodes in the generation pipeline
              </p>
            </div>
          )}
        </div>

        {/* Footer Stats */}
        {showDetails && queueItems.length > 0 && (
          <div className="bg-base-200/30 border-base-300 border-t px-6 py-3">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-success text-lg font-bold">
                  {Math.round(stats.successRate * 100)}%
                </div>
                <div className="text-base-content/60 text-xs">Success Rate</div>
              </div>
              <div>
                <div className="text-primary text-lg font-bold">
                  {formatTimeRemaining(stats.averageProcessingTime)}
                </div>
                <div className="text-base-content/60 text-xs">Avg Time</div>
              </div>
              <div>
                <div className="text-base-content text-lg font-bold">
                  ${stats.totalCostToday.toFixed(2)}
                </div>
                <div className="text-base-content/60 text-xs">
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
