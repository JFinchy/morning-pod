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

export default function QueueProcessorPage() {
  const [autoRefresh, setAutoRefresh] = useState(true);

  const { data: processorStatus, refetch: refetchStatus } =
    api.queueProcessor.getStatus.useQuery();

  const { data: _processorLogs } = api.queueProcessor.getLogs.useQuery({
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
        return <Activity className="text-success h-5 w-5 animate-pulse" />;
      case "paused":
        return <Pause className="text-warning h-5 w-5" />;
      case "error":
        return <AlertCircle className="text-error h-5 w-5" />;
      default:
        return <Clock className="text-base-content/60 h-5 w-5" />;
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-base-content text-2xl font-bold">
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
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Processor Status */}
        <div className="card bg-base-100 border-base-300 border shadow-sm">
          <div className="card-body">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-lg font-semibold">
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
            <div className="mb-6 flex flex-wrap gap-2">
              {processorStatus?.status === "idle" && (
                <Button
                  className="gap-2"
                  loading={startProcessor.isPending}
                  onClick={() => startProcessor.mutate()}
                  size="sm"
                  variant="primary"
                >
                  <Play className="h-4 w-4" />
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
                    <Pause className="h-4 w-4" />
                    Pause
                  </Button>
                  <Button
                    className="gap-2"
                    loading={stopProcessor.isPending}
                    onClick={() => stopProcessor.mutate()}
                    size="sm"
                    variant="error"
                  >
                    <Square className="h-4 w-4" />
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
                    <Play className="h-4 w-4" />
                    Resume
                  </Button>
                  <Button
                    className="gap-2"
                    loading={stopProcessor.isPending}
                    onClick={() => stopProcessor.mutate()}
                    size="sm"
                    variant="error"
                  >
                    <Square className="h-4 w-4" />
                    Stop
                  </Button>
                </>
              )}

              <Button btnStyle="outline" className="gap-2" size="sm">
                <Settings className="h-4 w-4" />
                Configure
              </Button>
            </div>

            {/* Statistics Grid */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
              <div className="stat bg-base-200/50 rounded-lg p-4">
                <div className="stat-figure text-info">
                  <Activity className="h-6 w-6" />
                </div>
                <div className="stat-title text-sm">Active Jobs</div>
                <div className="stat-value text-info text-2xl">
                  {processorStatus?.activeJobs || 0}
                </div>
              </div>

              <div className="stat bg-base-200/50 rounded-lg p-4">
                <div className="stat-figure text-success">
                  <CheckCircle className="h-6 w-6" />
                </div>
                <div className="stat-title text-sm">Processed Today</div>
                <div className="stat-value text-success text-2xl">
                  {processorStatus?.totalProcessedToday || 0}
                </div>
              </div>

              <div className="stat bg-base-200/50 rounded-lg p-4">
                <div className="stat-figure text-warning">
                  <Clock className="h-6 w-6" />
                </div>
                <div className="stat-title text-sm">Success Rate</div>
                <div className="stat-value text-warning text-2xl">
                  {processorStatus?.successRate
                    ? `${(processorStatus.successRate * 100).toFixed(1)}%`
                    : "0%"}
                </div>
              </div>

              <div className="stat bg-base-200/50 rounded-lg p-4">
                <div className="stat-figure text-error">
                  <DollarSign className="h-6 w-6" />
                </div>
                <div className="stat-title text-sm">Cost Today</div>
                <div className="stat-value text-error text-2xl">
                  ${processorStatus?.totalCostToday?.toFixed(2) || "0.00"}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="card bg-base-100 border-base-300 border shadow-sm">
          <div className="card-header border-base-300 border-b p-4">
            <h2 className="text-lg font-semibold">Performance Metrics</h2>
          </div>
          <div className="card-body">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {/* Average Processing Time */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Average Processing Time</span>
                  <span className="font-medium">
                    {processorStatus?.averageProcessingTime || 0}s
                  </span>
                </div>
                <div className="bg-base-300 h-2 w-full rounded-full">
                  <div
                    className="bg-primary h-2 rounded-full transition-all duration-300"
                    style={{
                      width: `${Math.min(100, ((processorStatus?.averageProcessingTime || 0) / 300) * 100)}%`,
                    }}
                  />
                </div>
                <p className="text-base-content/60 text-xs">
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
                <div className="bg-base-300 h-2 w-full rounded-full">
                  <div
                    className="bg-success h-2 rounded-full transition-all duration-300"
                    style={{
                      width: `${(processorStatus?.successRate || 0) * 100}%`,
                    }}
                  />
                </div>
                <p className="text-base-content/60 text-xs">
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
