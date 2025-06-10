"use client";

/**
 * Canary Monitoring Dashboard Component
 *
 * @business-context Real-time monitoring of canary deployments and feature flag
 *                   rollouts with automated rollback capabilities for safe releases
 */

import { useEffect, useState } from "react";

import { useSyntheticDashboard } from "../../lib/monitoring/synthetic-dashboard";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Progress } from "../ui/progress";

interface CanaryDeployment {
  branchName: string;
  deploymentUrl: string;
  featureFlags: string[];
  id: string;
  lastUpdated: Date;
  rolloutPercentage: number;
  startTime: Date;
  status: "completed" | "failed" | "rolled-back" | "rolling-out" | "testing";
  testScore: number;
}

interface CanaryMonitoringDashboardProps {
  className?: string;
}

export function CanaryMonitoringDashboard({
  className = "",
}: CanaryMonitoringDashboardProps) {
  const [deployments, setDeployments] = useState<CanaryDeployment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDeployment, setSelectedDeployment] = useState<null | string>(
    null
  );

  // Use synthetic dashboard for real-time metrics
  const { alerts, isConnected, metrics, subscribe, unsubscribe } =
    useSyntheticDashboard();

  useEffect(() => {
    // Subscribe to real-time updates
    const unsubscribeCallback = subscribe((update) => {
      console.log("Canary dashboard update:", update);
      // Update deployment status based on synthetic test results
      updateDeploymentStatus(update);
    });

    // Load initial deployments
    loadCanaryDeployments();

    return () => {
      if (unsubscribeCallback) {
        unsubscribeCallback();
      }
    };
  }, [subscribe]);

  const loadCanaryDeployments = async () => {
    setIsLoading(true);
    try {
      // Mock API call - would fetch from actual backend
      const mockDeployments: CanaryDeployment[] = [
        {
          branchName: "feat/enhanced-audio-player",
          deploymentUrl: "https://morning-pod-pr-123.vercel.app",
          featureFlags: ["enhanced-audio-player", "waveform-visualization"],
          id: "deploy-1",
          lastUpdated: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
          rolloutPercentage: 25,
          startTime: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
          status: "rolling-out",
          testScore: 92,
        },
        {
          branchName: "feat/improved-summarization",
          deploymentUrl: "https://morning-pod-pr-124.vercel.app",
          featureFlags: ["improved-summarization", "enhanced-keywords"],
          id: "deploy-2",
          lastUpdated: new Date(Date.now() - 2 * 60 * 1000), // 2 minutes ago
          rolloutPercentage: 0,
          startTime: new Date(Date.now() - 10 * 60 * 1000), // 10 minutes ago
          status: "testing",
          testScore: 88,
        },
      ];

      setDeployments(mockDeployments);
    } catch (error) {
      console.error("Failed to load canary deployments:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateDeploymentStatus = (update: any) => {
    setDeployments((prev) =>
      prev.map((deployment) => {
        if (deployment.deploymentUrl === update.deploymentUrl) {
          return {
            ...deployment,
            lastUpdated: new Date(),
            rolloutPercentage:
              update.rolloutPercentage || deployment.rolloutPercentage,
            status: update.status || deployment.status,
            testScore: update.testScore || deployment.testScore,
          };
        }
        return deployment;
      })
    );
  };

  const handleEmergencyRollback = async (deploymentId: string) => {
    const deployment = deployments.find((d) => d.id === deploymentId);
    if (!deployment) return;

    try {
      // Trigger emergency rollback
      await fetch("/api/canary/emergency-rollback", {
        body: JSON.stringify({
          deploymentId,
          deploymentUrl: deployment.deploymentUrl,
          reason: "Manual emergency rollback",
        }),
        headers: { "Content-Type": "application/json" },
        method: "POST",
      });

      // Update local state
      setDeployments((prev) =>
        prev.map((d) =>
          d.id === deploymentId
            ? {
                ...d,
                lastUpdated: new Date(),
                rolloutPercentage: 0,
                status: "rolled-back",
              }
            : d
        )
      );
    } catch (error) {
      console.error("Emergency rollback failed:", error);
    }
  };

  const getStatusColor = (status: CanaryDeployment["status"]) => {
    switch (status) {
      case "testing":
        return "bg-blue-100 text-blue-800";
      case "rolling-out":
        return "bg-yellow-100 text-yellow-800";
      case "completed":
        return "bg-green-100 text-green-800";
      case "failed":
        return "bg-red-100 text-red-800";
      case "rolled-back":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getTestScoreColor = (score: number) => {
    if (score >= 90) return "text-green-600";
    if (score >= 80) return "text-yellow-600";
    return "text-red-600";
  };

  if (isLoading) {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="animate-pulse">
          <div className="mb-4 h-6 rounded bg-gray-200" />
          <div className="space-y-3">
            <div className="h-32 rounded bg-gray-200" />
            <div className="h-32 rounded bg-gray-200" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Canary Monitoring</h2>
          <p className="text-gray-600">
            Real-time monitoring of canary deployments and feature rollouts
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div
            className={`h-3 w-3 rounded-full ${isConnected ? "bg-green-500" : "bg-red-500"}`}
          />
          <span className="text-sm text-gray-600">
            {isConnected ? "Connected" : "Disconnected"}
          </span>
        </div>
      </div>

      {/* Alerts */}
      {alerts.length > 0 && (
        <div className="space-y-2">
          {alerts.map((alert, index) => (
            <div
              className={`rounded-lg border p-4 ${
                alert.severity === "critical"
                  ? "border-red-200 bg-red-50"
                  : alert.severity === "high"
                    ? "border-yellow-200 bg-yellow-50"
                    : "border-blue-200 bg-blue-50"
              }`}
              key={index}
            >
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="text-sm font-semibold">{alert.message}</h4>
                  <p className="mt-1 text-sm text-gray-600">{alert.type}</p>
                </div>
                <Badge
                  variant={
                    alert.severity === "critical" ? "warning" : "secondary"
                  }
                >
                  {alert.severity}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Deployments */}
      <div className="grid gap-4">
        {deployments.map((deployment) => (
          <Card className="relative" key={deployment.id}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">
                    {deployment.branchName}
                  </CardTitle>
                  <p className="mt-1 text-sm text-gray-600">
                    {deployment.deploymentUrl}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Badge className={getStatusColor(deployment.status)}>
                    {deployment.status}
                  </Badge>

                  {(deployment.status === "rolling-out" ||
                    deployment.status === "testing") && (
                    <Button
                      onClick={() => handleEmergencyRollback(deployment.id)}
                      size="sm"
                      variant="error"
                    >
                      Emergency Rollback
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Test Score */}
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Test Score</span>
                <span
                  className={`text-lg font-bold ${getTestScoreColor(deployment.testScore)}`}
                >
                  {deployment.testScore}/100
                </span>
              </div>

              {/* Rollout Progress */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Rollout Progress</span>
                  <span className="text-sm text-gray-600">
                    {deployment.rolloutPercentage}% of users
                  </span>
                </div>
                <Progress
                  className="h-2"
                  value={deployment.rolloutPercentage}
                />
              </div>

              {/* Feature Flags */}
              <div className="space-y-2">
                <span className="text-sm font-medium">Feature Flags</span>
                <div className="flex flex-wrap gap-1">
                  {deployment.featureFlags.map((flag) => (
                    <Badge className="text-xs" key={flag} variant="outline">
                      {flag}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Timing */}
              <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                <div>
                  <span className="font-medium">Started:</span>
                  <br />
                  {deployment.startTime.toLocaleTimeString()}
                </div>
                <div>
                  <span className="font-medium">Last Updated:</span>
                  <br />
                  {deployment.lastUpdated.toLocaleTimeString()}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {deployments.length === 0 && (
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-gray-600">No active canary deployments</p>
              <p className="mt-1 text-sm text-gray-500">
                Canary deployments will appear here when triggered by PR
                deployments
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Overall Metrics */}
      {metrics && (
        <Card>
          <CardHeader>
            <CardTitle>System Metrics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              <div className="rounded-lg border bg-white p-4">
                <h4 className="text-sm font-medium text-gray-600">
                  Success Rate
                </h4>
                <p className="text-2xl font-bold text-green-600">
                  {metrics?.overview.successRate
                    ? `${(metrics.overview.successRate * 100).toFixed(1)}%`
                    : "0%"}
                </p>
              </div>

              <div className="rounded-lg border bg-white p-4">
                <h4 className="text-sm font-medium text-gray-600">
                  Avg Response Time
                </h4>
                <p className="text-2xl font-bold text-blue-600">
                  {metrics?.overview.averageExecutionTime
                    ? `${Math.round(metrics.overview.averageExecutionTime)}ms`
                    : "0ms"}
                </p>
              </div>

              <div className="rounded-lg border bg-white p-4">
                <h4 className="text-sm font-medium text-gray-600">
                  Total Tests
                </h4>
                <p className="text-2xl font-bold text-gray-800">
                  {metrics?.overview.totalTests || 0}
                </p>
              </div>

              <div className="rounded-lg border bg-white p-4">
                <h4 className="text-sm font-medium text-gray-600">
                  Active Alerts
                </h4>
                <p className="text-2xl font-bold text-red-600">
                  {alerts.length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
