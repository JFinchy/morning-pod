"use client";

import {
  Activity,
  AlertCircle,
  CheckCircle,
  Clock,
  DollarSign,
  Pause,
  Play,
  RefreshCw,
  Settings,
  Square,
} from "lucide-react";
import { useState } from "react";

import { MainLayout } from "@/components/layouts";
import { Button } from "@/components/ui";
import { api } from "@/lib/trpc/client";

export default function QueueManagementPage() {
  const [autoRefresh, setAutoRefresh] = useState(true);

  const { data: processorStatus, refetch: refetchStatus } =
    api.queueProcessor.getStatus.useQuery();

  const { data: processorLogs } = api.queueProcessor.getLogs.useQuery({
    limit: 20,
  });

  const startProcessor = api.queueProcessor.start.useMutation({
    onSuccess: () => {
      refetchStatus();
    },
  });

  const stopProcessor = api.queueProcessor.stop.useMutation({
    onSuccess: () => {
      refetchStatus();
    },
  });

  const pauseProcessor = api.queueProcessor.pause.useMutation({
    onSuccess: () => {
      refetchStatus();
    },
  });

  const resumeProcessor = api.queueProcessor.resume.useMutation({
    onSuccess: () => {
      refetchStatus();
    },
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "processing":
        return "text-success";
      case "paused":
        return "text-warning";
      case "error":
        return "text-error";
      default:
        return "text-base-content/60";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "processing":
        return <Activity className="w-5 h-5 text-success animate-pulse" />;
      case "paused":
        return <Pause className="w-5 h-5 text-warning" />;
      case "error":
        return <AlertCircle className="w-5 h-5 text-error" />;
      default:
        return <Clock className="w-5 h-5 text-base-content/60" />;
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-base-content">
              Queue Processor Management
            </h1>
            <p className="text-base-content/60">
              Control and monitor the podcast generation pipeline
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
            <Button
              btnStyle="outline"
              className="gap-2"
              onClick={() => refetchStatus()}
              size="sm"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Processor Status */}
        <div className="card bg-base-100 shadow-sm border border-base-300">
          <div className="card-body">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                {processorStatus && getStatusIcon(processorStatus.status)}
                Processor Status
              </h2>

              <div className="flex items-center gap-2">
                <span
                  className={`text-sm font-medium ${getStatusColor(processorStatus?.status || "idle")}`}
                >
                  {processorStatus?.status?.toUpperCase() || "IDLE"}
                </span>
              </div>
            </div>

            {/* Control Buttons */}
            <div className="flex flex-wrap gap-2 mb-6">
              {processorStatus?.status === "idle" && (
                <Button
                  className="gap-2"
                  loading={startProcessor.isPending}
                  onClick={() => startProcessor.mutate()}
                  size="sm"
                  variant="primary"
                >
                  <Play className="w-4 h-4" />
                  Start Processor
                </Button>
              )}

              {processorStatus?.status === "processing" && (
                <>
                  <Button
                    btnStyle="outline"
                    className="gap-2"
                    loading={pauseProcessor.isPending}
                    onClick={() => pauseProcessor.mutate()}
                    size="sm"
                  >
                    <Pause className="w-4 h-4" />
                    Pause
                  </Button>
                  <Button
                    className="gap-2"
                    loading={stopProcessor.isPending}
                    onClick={() => stopProcessor.mutate()}
                    size="sm"
                    variant="error"
                  >
                    <Square className="w-4 h-4" />
                    Stop
                  </Button>
                </>
              )}

              {processorStatus?.status === "paused" && (
                <>
                  <Button
                    className="gap-2"
                    loading={resumeProcessor.isPending}
                    onClick={() => resumeProcessor.mutate()}
                    size="sm"
                    variant="primary"
                  >
                    <Play className="w-4 h-4" />
                    Resume
                  </Button>
                  <Button
                    className="gap-2"
                    loading={stopProcessor.isPending}
                    onClick={() => stopProcessor.mutate()}
                    size="sm"
                    variant="error"
                  >
                    <Square className="w-4 h-4" />
                    Stop
                  </Button>
                </>
              )}

              <Button btnStyle="outline" className="gap-2" size="sm">
                <Settings className="w-4 h-4" />
                Configure
              </Button>
            </div>

            {/* Statistics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="stat bg-base-200/50 rounded-lg p-4">
                <div className="stat-figure text-info">
                  <Activity className="w-6 h-6" />
                </div>
                <div className="stat-title text-sm">Active Jobs</div>
                <div className="stat-value text-2xl text-info">
                  {processorStatus?.activeJobs || 0}
                </div>
              </div>

              <div className="stat bg-base-200/50 rounded-lg p-4">
                <div className="stat-figure text-success">
                  <CheckCircle className="w-6 h-6" />
                </div>
                <div className="stat-title text-sm">Processed Today</div>
                <div className="stat-value text-2xl text-success">
                  {processorStatus?.totalProcessedToday || 0}
                </div>
              </div>

              <div className="stat bg-base-200/50 rounded-lg p-4">
                <div className="stat-figure text-warning">
                  <Clock className="w-6 h-6" />
                </div>
                <div className="stat-title text-sm">Success Rate</div>
                <div className="stat-value text-2xl text-warning">
                  {processorStatus?.successRate
                    ? `${(processorStatus.successRate * 100).toFixed(1)}%`
                    : "0%"}
                </div>
              </div>

              <div className="stat bg-base-200/50 rounded-lg p-4">
                <div className="stat-figure text-error">
                  <DollarSign className="w-6 h-6" />
                </div>
                <div className="stat-title text-sm">Cost Today</div>
                <div className="stat-value text-2xl text-error">
                  ${processorStatus?.totalCostToday?.toFixed(2) || "0.00"}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Processing Logs */}
        <div className="card bg-base-100 shadow-sm border border-base-300">
          <div className="card-header p-4 border-b border-base-300">
            <h2 className="text-lg font-semibold">Processing Logs</h2>
          </div>
          <div className="card-body p-0">
            {!processorLogs?.logs || processorLogs.logs.length === 0 ? (
              <div className="text-center py-8">
                <Activity className="w-12 h-12 mx-auto mb-4 text-base-content/30" />
                <h3 className="text-lg font-medium text-base-content mb-2">
                  No logs available
                </h3>
                <p className="text-base-content/60">
                  Start the processor to see processing logs
                </p>
              </div>
            ) : (
              <div className="space-y-2 p-4">
                {processorLogs.logs.map((log) => (
                  <div
                    className={`flex items-start gap-3 p-3 rounded-lg ${
                      log.level === "warning"
                        ? "bg-warning/10 border border-warning/20"
                        : log.level === "error"
                          ? "bg-error/10 border border-error/20"
                          : "bg-base-200/50"
                    }`}
                    key={log.id}
                  >
                    <div className="flex-shrink-0 mt-0.5">
                      {log.level === "warning" ? (
                        <AlertCircle className="w-4 h-4 text-warning" />
                      ) : (
                        <CheckCircle className="w-4 h-4 text-success" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm text-base-content/60">
                          {log.timestamp.toLocaleTimeString()}
                        </span>
                        {log.queueItemId && (
                          <span className="badge badge-sm badge-outline">
                            {log.queueItemId}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-base-content">{log.message}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="card bg-base-100 shadow-sm border border-base-300">
          <div className="card-header p-4 border-b border-base-300">
            <h2 className="text-lg font-semibold">Performance Metrics</h2>
          </div>
          <div className="card-body">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Average Processing Time */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Average Processing Time</span>
                  <span className="font-medium">
                    {processorStatus?.averageProcessingTime || 0}s
                  </span>
                </div>
                <div className="w-full bg-base-300 rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-all duration-300"
                    style={{
                      width: `${Math.min(100, ((processorStatus?.averageProcessingTime || 0) / 300) * 100)}%`,
                    }}
                  />
                </div>
                <p className="text-xs text-base-content/60">
                  Target: under 5 minutes
                </p>
              </div>

              {/* Success Rate */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Success Rate</span>
                  <span className="font-medium">
                    {processorStatus?.successRate
                      ? `${(processorStatus.successRate * 100).toFixed(1)}%`
                      : "0%"}
                  </span>
                </div>
                <div className="w-full bg-base-300 rounded-full h-2">
                  <div
                    className="bg-success h-2 rounded-full transition-all duration-300"
                    style={{
                      width: `${(processorStatus?.successRate || 0) * 100}%`,
                    }}
                  />
                </div>
                <p className="text-xs text-base-content/60">
                  Target: above 90%
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
