"use client";

import {
  AlertCircle,
  Clock,
  Pause,
  Play,
  RefreshCw,
  SkipForward,
} from "lucide-react";
import { useState } from "react";

import { QueueStatus } from "@/components/features";
import { MainLayout } from "@/components/layouts";
import { Button } from "@/components/ui";
import { api } from "@/lib/trpc/client";

export default function QueuePage() {
  const [autoRefresh, setAutoRefresh] = useState(true);

  const { data: queueStats } = api.queue.getStats.useQuery();
  const { data: queueItems } = api.queue.getAll.useQuery({});

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "badge-warning";
      case "processing":
        return "badge-info";
      case "completed":
        return "badge-success";
      case "failed":
        return "badge-error";
      default:
        return "badge-ghost";
    }
  };

  // TODO: Use for priority-based styling
  // const getPriorityColor = (priority: string) => {
  //   switch (priority) {
  //     case "high":
  //       return "text-error";
  //     case "medium":
  //       return "text-warning";
  //     case "low":
  //       return "text-base-content/60";
  //     default:
  //       return "text-base-content";
  //   }
  // };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-base-content text-2xl font-bold">
              Generation Queue
            </h1>
            <p className="text-base-content/60">
              {queueStats?.active || 0} processing • {queueStats?.total || 0}{" "}
              total items
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="form-control">
              <label className="label cursor-pointer gap-2">
                <span className="label-text text-sm">Auto-refresh</span>
                <input
                  checked={autoRefresh}
                  className="toggle toggle-primary toggle-sm"
                  onChange={(e) => setAutoRefresh(e.target.checked)}
                  type="checkbox"
                />
              </label>
            </div>
            <Button btnStyle="outline" className="gap-2" size="sm">
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
            <Button className="gap-2" size="sm" variant="primary">
              <Play className="h-4 w-4" />
              Start Queue
            </Button>
          </div>
        </div>

        {/* Queue Status Component */}
        <QueueStatus
          queueItems={
            queueItems?.queueItems?.map((item) => ({
              ...item,
              completedAt: item.completedAt ?? undefined,
              cost: item.cost ? Number(item.cost) : undefined,
              errorMessage: item.errorMessage ?? undefined,
              estimatedTimeRemaining: item.estimatedTimeRemaining ?? undefined,
              startedAt: item.startedAt ?? undefined,
            })) || []
          }
          stats={{
            averageProcessingTime: 180, // 3 minutes default
            currentlyProcessing: queueStats?.active || 0,
            estimatedWaitTime: 600, // 10 minutes default
            successRate: 0.92, // 92% default
            totalCostToday: Number(queueStats?.totalCost) || 0,
            totalInQueue: queueStats?.total || 0,
          }}
        />

        {/* Quick Stats */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <div className="stat bg-base-100 border-base-300 rounded-lg border shadow-sm">
            <div className="stat-figure text-info">
              <Clock className="h-6 w-6" />
            </div>
            <div className="stat-title">In Progress</div>
            <div className="stat-value text-info">
              {queueStats?.active || 0}
            </div>
            <div className="stat-desc">Currently processing</div>
          </div>

          <div className="stat bg-base-100 border-base-300 rounded-lg border shadow-sm">
            <div className="stat-figure text-warning">
              <Pause className="h-6 w-6" />
            </div>
            <div className="stat-title">Pending</div>
            <div className="stat-value text-warning">
              {queueItems?.queueItems?.filter(
                (item) => item.status === "pending"
              ).length || 0}
            </div>
            <div className="stat-desc">Waiting to start</div>
          </div>

          <div className="stat bg-base-100 border-base-300 rounded-lg border shadow-sm">
            <div className="stat-figure text-success">
              <Play className="h-6 w-6" />
            </div>
            <div className="stat-title">Completed</div>
            <div className="stat-value text-success">
              {queueItems?.queueItems?.filter(
                (item) => item.status === "completed"
              ).length || 0}
            </div>
            <div className="stat-desc">Successfully finished</div>
          </div>

          <div className="stat bg-base-100 border-base-300 rounded-lg border shadow-sm">
            <div className="stat-figure text-error">
              <AlertCircle className="h-6 w-6" />
            </div>
            <div className="stat-title">Failed</div>
            <div className="stat-value text-error">
              {queueItems?.queueItems?.filter(
                (item) => item.status === "failed"
              ).length || 0}
            </div>
            <div className="stat-desc">Need attention</div>
          </div>
        </div>

        {/* Queue Items */}
        <div className="card bg-base-100 border-base-300 border shadow-sm">
          <div className="card-header border-base-300 border-b p-4">
            <h2 className="text-lg font-semibold">Queue Items</h2>
          </div>
          <div className="card-body p-0">
            {!queueItems?.queueItems || queueItems.queueItems.length === 0 ? (
              <div className="py-12 text-center">
                <Clock className="text-base-content/30 mx-auto mb-4 h-12 w-12" />
                <h3 className="text-base-content mb-2 text-lg font-medium">
                  Queue is empty
                </h3>
                <p className="text-base-content/60">
                  No episodes are currently in the generation queue
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="table-zebra table">
                  <thead>
                    <tr>
                      <th>Episode</th>
                      <th>Source</th>
                      <th>Priority</th>
                      <th>Status</th>
                      <th>Progress</th>
                      <th>Created</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {queueItems.queueItems.map((item) => (
                      <tr key={item.id}>
                        <td>
                          <div>
                            <div className="font-medium">
                              {item.episodeTitle}
                            </div>
                            {item.progress !== undefined &&
                              item.progress > 0 && (
                                <div className="mt-1">
                                  <div className="progress progress-primary h-2 w-24">
                                    <div
                                      className="progress-bar"
                                      style={{ width: `${item.progress}%` }}
                                    />
                                  </div>
                                </div>
                              )}
                          </div>
                        </td>
                        <td>
                          <span className="badge badge-outline">
                            {item.sourceId}
                          </span>
                        </td>
                        <td>
                          <span className="text-base-content font-medium capitalize">
                            Position {item.position + 1}
                          </span>
                        </td>
                        <td>
                          <div
                            className={`badge ${getStatusColor(item.status)}`}
                          >
                            {item.status}
                          </div>
                        </td>
                        <td>
                          {item.progress !== undefined ? (
                            <div className="flex items-center gap-2">
                              <span className="text-sm">{item.progress}%</span>
                              {[
                                "generating-audio",
                                "scraping",
                                "summarizing",
                                "uploading",
                              ].includes(item.status) && (
                                <span className="loading loading-spinner loading-xs" />
                              )}
                            </div>
                          ) : (
                            <span className="text-base-content/50">-</span>
                          )}
                        </td>
                        <td>
                          <span className="text-base-content/60 text-sm">
                            {item.startedAt
                              ? new Date(item.startedAt).toLocaleTimeString()
                              : "-"}
                          </span>
                        </td>
                        <td>
                          <div className="flex gap-1">
                            {item.status === "pending" && (
                              <Button
                                btnStyle="ghost"
                                size="xs"
                                title="Move to front"
                              >
                                <SkipForward className="h-3 w-3" />
                              </Button>
                            )}
                            {(item.status === "failed" ||
                              item.status === "pending") && (
                              <Button btnStyle="ghost" size="xs" title="Retry">
                                <RefreshCw className="h-3 w-3" />
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* System Status */}
        <div className="card bg-base-100 border-base-300 border shadow-sm">
          <div className="card-body p-6">
            <h3 className="mb-4 text-lg font-semibold">System Status</h3>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <h4 className="mb-2 font-medium">Processing Capacity</h4>
                <div className="progress progress-primary mb-2 w-full">
                  <div className="progress-bar" style={{ width: "65%" }} />
                </div>
                <p className="text-base-content/60 text-sm">
                  3 of 5 workers active
                </p>
              </div>
              <div>
                <h4 className="mb-2 font-medium">Daily Limits</h4>
                <div className="progress progress-warning mb-2 w-full">
                  <div className="progress-bar" style={{ width: "42%" }} />
                </div>
                <p className="text-base-content/60 text-sm">
                  42 of 100 episodes generated today
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
