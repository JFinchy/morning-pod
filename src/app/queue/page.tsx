"use client";

import {
  Clock,
  Play,
  Pause,
  SkipForward,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import { useState } from "react";

import { QueueStatusV2 } from "@/components/internal/variants";
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

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "text-error";
      case "medium":
        return "text-warning";
      case "low":
        return "text-base-content/60";
      default:
        return "text-base-content";
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-base-content">
              Generation Queue
            </h1>
            <p className="text-base-content/60">
              {queueStats?.currentlyProcessing || 0} processing •{" "}
              {queueStats?.totalInQueue || 0} total items
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="form-control">
              <label className="label cursor-pointer gap-2">
                <span className="label-text text-sm">Auto-refresh</span>
                <input
                  type="checkbox"
                  className="toggle toggle-primary toggle-sm"
                  checked={autoRefresh}
                  onChange={(e) => setAutoRefresh(e.target.checked)}
                />
              </label>
            </div>
            <Button btnStyle="outline" size="sm" className="gap-2">
              <RefreshCw className="w-4 h-4" />
              Refresh
            </Button>
            <Button variant="primary" size="sm" className="gap-2">
              <Play className="w-4 h-4" />
              Start Queue
            </Button>
          </div>
        </div>

        {/* Queue Status Component */}
        <QueueStatusV2
          queueItems={queueItems || []}
          stats={
            queueStats || {
              totalInQueue: 0,
              currentlyProcessing: 0,
              averageProcessingTime: 0,
              estimatedWaitTime: 0,
              successRate: 0,
              totalCostToday: 0,
            }
          }
        />

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="stat bg-base-100 rounded-lg shadow-sm border border-base-300">
            <div className="stat-figure text-info">
              <Clock className="w-6 h-6" />
            </div>
            <div className="stat-title">In Progress</div>
            <div className="stat-value text-info">
              {queueStats?.currentlyProcessing || 0}
            </div>
            <div className="stat-desc">Currently processing</div>
          </div>

          <div className="stat bg-base-100 rounded-lg shadow-sm border border-base-300">
            <div className="stat-figure text-warning">
              <Pause className="w-6 h-6" />
            </div>
            <div className="stat-title">Pending</div>
            <div className="stat-value text-warning">
              {queueItems?.filter((item) => item.status === "pending").length ||
                0}
            </div>
            <div className="stat-desc">Waiting to start</div>
          </div>

          <div className="stat bg-base-100 rounded-lg shadow-sm border border-base-300">
            <div className="stat-figure text-success">
              <Play className="w-6 h-6" />
            </div>
            <div className="stat-title">Completed</div>
            <div className="stat-value text-success">
              {queueItems?.filter((item) => item.status === "completed")
                .length || 0}
            </div>
            <div className="stat-desc">Successfully finished</div>
          </div>

          <div className="stat bg-base-100 rounded-lg shadow-sm border border-base-300">
            <div className="stat-figure text-error">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div className="stat-title">Failed</div>
            <div className="stat-value text-error">
              {queueItems?.filter((item) => item.status === "failed").length ||
                0}
            </div>
            <div className="stat-desc">Need attention</div>
          </div>
        </div>

        {/* Queue Items */}
        <div className="card bg-base-100 shadow-sm border border-base-300">
          <div className="card-header p-4 border-b border-base-300">
            <h2 className="text-lg font-semibold">Queue Items</h2>
          </div>
          <div className="card-body p-0">
            {!queueItems || queueItems.length === 0 ? (
              <div className="text-center py-12">
                <Clock className="w-12 h-12 mx-auto mb-4 text-base-content/30" />
                <h3 className="text-lg font-medium text-base-content mb-2">
                  Queue is empty
                </h3>
                <p className="text-base-content/60">
                  No episodes are currently in the generation queue
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="table table-zebra">
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
                    {queueItems.map((item) => (
                      <tr key={item.id}>
                        <td>
                          <div>
                            <div className="font-medium">
                              {item.episodeTitle}
                            </div>
                            {item.progress !== undefined &&
                              item.progress > 0 && (
                                <div className="mt-1">
                                  <div className="progress progress-primary w-24 h-2">
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
                          <span className="font-medium capitalize text-base-content">
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
                                "scraping",
                                "summarizing",
                                "generating-audio",
                                "uploading",
                              ].includes(item.status) && (
                                <span className="loading loading-spinner loading-xs"></span>
                              )}
                            </div>
                          ) : (
                            <span className="text-base-content/50">-</span>
                          )}
                        </td>
                        <td>
                          <span className="text-sm text-base-content/60">
                            {item.startedAt
                              ? new Date(item.startedAt).toLocaleTimeString()
                              : "-"}
                          </span>
                        </td>
                        <td>
                          <div className="flex gap-1">
                            {item.status === "pending" && (
                              <Button
                                size="xs"
                                btnStyle="ghost"
                                title="Move to front"
                              >
                                <SkipForward className="w-3 h-3" />
                              </Button>
                            )}
                            {(item.status === "failed" ||
                              item.status === "pending") && (
                              <Button size="xs" btnStyle="ghost" title="Retry">
                                <RefreshCw className="w-3 h-3" />
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
        <div className="card bg-base-100 shadow-sm border border-base-300">
          <div className="card-body p-6">
            <h3 className="text-lg font-semibold mb-4">System Status</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium mb-2">Processing Capacity</h4>
                <div className="progress progress-primary w-full mb-2">
                  <div className="progress-bar" style={{ width: "65%" }} />
                </div>
                <p className="text-sm text-base-content/60">
                  3 of 5 workers active
                </p>
              </div>
              <div>
                <h4 className="font-medium mb-2">Daily Limits</h4>
                <div className="progress progress-warning w-full mb-2">
                  <div className="progress-bar" style={{ width: "42%" }} />
                </div>
                <p className="text-sm text-base-content/60">
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
