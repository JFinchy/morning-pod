/**
 * Synthetic User Testing Dashboard
 *
 * @business-context Provides real-time monitoring and visualization of synthetic
 *                   user test results for canary deployment decision making.
 *                   Integrates with monitoring stack for comprehensive oversight.
 * @decision-date 2024-01-22
 * @decision-by Development team for operational visibility
 */

import { useCallback, useEffect, useState } from "react";

import {
  PerformanceMetrics,
  type SyntheticTestReport,
  SyntheticUserType,
  type TestExecutionResult,
  type TestScenario,
} from "@/lib/testing/synthetic-users";

/**
 * Dashboard metrics aggregation
 */
export interface DashboardMetrics {
  alerts: DashboardAlert[];
  overview: {
    activeUsers: number;
    averageExecutionTime: number;
    lastUpdated: Date;
    successRate: number;
    totalTests: number;
  };
  performance: {
    averageCLS: number;
    averageFCP: number;
    averageINP: number;
    averageLCP: number;
    averagePageLoadTime: number;
    memoryUsage: number;
  };
  scenarios: Record<
    TestScenario,
    {
      averageDuration: number;
      errorRate: number;
      lastRun: Date;
      successRate: number;
    }
  >;
  trends: {
    errorRateHistory: TimeSeriesPoint[];
    performanceHistory: TimeSeriesPoint[];
    successRateHistory: TimeSeriesPoint[];
  };
  userTypes: Record<
    SyntheticUserType,
    {
      averageSessionDuration: number;
      errorCount: number;
      successRate: number;
      testCount: number;
    }
  >;
}

export interface DashboardAlert {
  id: string;
  message: string;
  metadata?: Record<string, any>;
  resolved: boolean;
  severity: "critical" | "high" | "low" | "medium";
  timestamp: Date;
  type: "error" | "failure" | "performance" | "timeout";
}

export interface TimeSeriesPoint {
  metadata?: Record<string, any>;
  timestamp: Date;
  value: number;
}

/**
 * Real-time dashboard for synthetic user testing
 *
 * @business-context Provides live monitoring of synthetic user test execution
 *                   enabling rapid response to issues and confident canary deployments
 */
export class SyntheticDashboard {
  private alerts: DashboardAlert[] = [];
  private metrics: DashboardMetrics;
  private subscribers: ((metrics: DashboardMetrics) => void)[] = [];
  private updateInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.metrics = this.initializeMetrics();
  }

  /**
   * Export metrics for external monitoring systems
   *
   * @business-context Provides data in format suitable for Grafana,
   *                   New Relic, or other monitoring dashboards
   */
  exportForMonitoring(): Record<string, any> {
    return {
      synthetic_alerts_active: this.getActiveAlerts().length,
      synthetic_alerts_critical: this.getActiveAlerts().filter(
        (a) => a.severity === "critical"
      ).length,
      synthetic_performance_cls: this.metrics.performance.averageCLS,
      synthetic_performance_fcp_ms: this.metrics.performance.averageFCP,
      synthetic_performance_inp_ms: this.metrics.performance.averageINP,
      synthetic_performance_lcp_ms: this.metrics.performance.averageLCP,
      synthetic_performance_page_load_ms:
        this.metrics.performance.averagePageLoadTime,
      synthetic_tests_active_users: this.metrics.overview.activeUsers,
      synthetic_tests_avg_duration_ms:
        this.metrics.overview.averageExecutionTime,
      synthetic_tests_success_rate: this.metrics.overview.successRate,
      synthetic_tests_total: this.metrics.overview.totalTests,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Get active alerts
   */
  getActiveAlerts(): DashboardAlert[] {
    return this.alerts.filter((a) => !a.resolved);
  }

  /**
   * Get current metrics
   */
  getMetrics(): DashboardMetrics {
    return { ...this.metrics };
  }

  /**
   * Clear all metrics and alerts
   */
  reset(): void {
    this.metrics = this.initializeMetrics();
    this.alerts = [];
    this.notifySubscribers();
  }

  /**
   * Resolve alert
   */
  resolveAlert(alertId: string): void {
    const alert = this.alerts.find((a) => a.id === alertId);
    if (alert) {
      alert.resolved = true;
    }
    this.metrics.alerts = this.alerts.filter((a) => !a.resolved);
    this.notifySubscribers();
  }

  /**
   * Start automatic metric updates
   */
  startAutoUpdate(intervalMs: number = 30000): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
    }

    this.updateInterval = setInterval(() => {
      this.metrics.overview.lastUpdated = new Date();
      this.notifySubscribers();
    }, intervalMs);
  }

  /**
   * Stop automatic updates
   */
  stopAutoUpdate(): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
  }

  /**
   * Subscribe to metric updates
   */
  subscribe(callback: (metrics: DashboardMetrics) => void): () => void {
    this.subscribers.push(callback);

    // Return unsubscribe function
    return () => {
      const index = this.subscribers.indexOf(callback);
      if (index > -1) {
        this.subscribers.splice(index, 1);
      }
    };
  }

  /**
   * Update dashboard with new test results
   *
   * @business-context Processes incoming test results to update real-time metrics
   *                   and trigger alerts when thresholds are exceeded
   */
  updateMetrics(report: SyntheticTestReport): void {
    const now = new Date();

    // Update overview metrics
    this.metrics.overview = {
      activeUsers: Object.keys(report.userBreakdown).length,
      averageExecutionTime: report.summary.averageDuration,
      lastUpdated: now,
      successRate: report.summary.successRate,
      totalTests: report.summary.totalTests,
    };

    // Update performance metrics
    this.updatePerformanceMetrics(report.detailedResults);

    // Update scenario metrics
    this.updateScenarioMetrics(report);

    // Update user type metrics
    this.updateUserTypeMetrics(report);

    // Update trends
    this.updateTrends(report);

    // Check for alerts
    this.checkAlerts(report);

    // Notify subscribers
    this.notifySubscribers();
  }

  /**
   * Add new alert
   */
  private addAlert(alert: DashboardAlert): void {
    // Check if similar alert already exists
    const existingSimilar = this.alerts.find(
      (a) =>
        a.type === alert.type &&
        a.severity === alert.severity &&
        !a.resolved &&
        Date.now() - a.timestamp.getTime() < 300000 // 5 minutes
    );

    if (!existingSimilar) {
      this.alerts.push(alert);
    }
  }

  /**
   * Check for alert conditions
   *
   * @business-context Monitors key metrics for threshold violations
   *                   enabling rapid response to degraded performance or failures
   */
  private checkAlerts(report: SyntheticTestReport): void {
    const now = new Date();

    // Success rate alert
    if (report.summary.successRate < 0.95) {
      this.addAlert({
        id: `success-rate-${now.getTime()}`,
        message: `Success rate dropped to ${(report.summary.successRate * 100).toFixed(1)}%`,
        metadata: { successRate: report.summary.successRate },
        resolved: false,
        severity: report.summary.successRate < 0.8 ? "critical" : "high",
        timestamp: now,
        type: "failure",
      });
    }

    // Performance alert
    if (report.summary.averageDuration > 30000) {
      // 30 seconds
      this.addAlert({
        id: `performance-${now.getTime()}`,
        message: `Average execution time is ${Math.round(report.summary.averageDuration / 1000)}s`,
        metadata: { averageDuration: report.summary.averageDuration },
        resolved: false,
        severity:
          report.summary.averageDuration > 60000 ? "critical" : "medium",
        timestamp: now,
        type: "performance",
      });
    }

    // Error rate alert
    const errorRate =
      report.summary.totalTests > 0
        ? report.summary.failedTests / report.summary.totalTests
        : 0;

    if (errorRate > 0.1) {
      // 10% error rate
      this.addAlert({
        id: `error-rate-${now.getTime()}`,
        message: `Error rate is ${(errorRate * 100).toFixed(1)}%`,
        metadata: { errorRate },
        resolved: false,
        severity: errorRate > 0.2 ? "critical" : "high",
        timestamp: now,
        type: "error",
      });
    }

    // Clean up old alerts (keep last 50)
    this.alerts = this.alerts.slice(-50);
    this.metrics.alerts = this.alerts.filter((a) => !a.resolved);
  }

  /**
   * Initialize empty metrics structure
   */
  private initializeMetrics(): DashboardMetrics {
    return {
      alerts: [],
      overview: {
        activeUsers: 0,
        averageExecutionTime: 0,
        lastUpdated: new Date(),
        successRate: 0,
        totalTests: 0,
      },
      performance: {
        averageCLS: 0,
        averageFCP: 0,
        averageINP: 0,
        averageLCP: 0,
        averagePageLoadTime: 0,
        memoryUsage: 0,
      },
      scenarios: {} as any,
      trends: {
        errorRateHistory: [],
        performanceHistory: [],
        successRateHistory: [],
      },
      userTypes: {} as any,
    };
  }

  /**
   * Notify all subscribers of updates
   */
  private notifySubscribers(): void {
    for (const callback of this.subscribers) {
      try {
        callback(this.metrics);
      } catch (error) {
        console.error("Error notifying dashboard subscriber:", error);
      }
    }
  }

  /**
   * Update performance metrics from test results
   */
  private updatePerformanceMetrics(results: TestExecutionResult[]): void {
    if (results.length === 0) return;

    const validMetrics = results
      .map((r) => r.metrics)
      .filter((m) => m && m.pageLoadTime > 0);

    if (validMetrics.length === 0) return;

    const avg = (arr: number[]) => arr.reduce((a, b) => a + b, 0) / arr.length;

    this.metrics.performance = {
      averageCLS: avg(validMetrics.map((m) => m.cumulativeLayoutShift)),
      averageFCP: avg(validMetrics.map((m) => m.firstContentfulPaint)),
      averageINP: avg(validMetrics.map((m) => m.interactionToNextPaint)),
      averageLCP: avg(validMetrics.map((m) => m.largestContentfulPaint)),
      averagePageLoadTime: avg(validMetrics.map((m) => m.pageLoadTime)),
      memoryUsage: avg(validMetrics.map((m) => m.memoryUsage || 0)),
    };
  }

  /**
   * Update scenario-specific metrics
   */
  private updateScenarioMetrics(report: SyntheticTestReport): void {
    for (const [scenario, stats] of Object.entries(report.scenarioBreakdown)) {
      const scenarioResults = report.detailedResults.filter(
        (r) => r.scenario === scenario
      );

      const averageDuration =
        scenarioResults.length > 0
          ? scenarioResults.reduce((sum, r) => sum + r.duration, 0) /
            scenarioResults.length
          : 0;

      const errorRate =
        stats.total > 0 ? (stats.total - stats.success) / stats.total : 0;

      const lastRun =
        scenarioResults.length > 0
          ? new Date(
              Math.max(...scenarioResults.map((r) => r.endTime.getTime()))
            )
          : new Date();

      this.metrics.scenarios[scenario as TestScenario] = {
        averageDuration,
        errorRate,
        lastRun,
        successRate: stats.total > 0 ? stats.success / stats.total : 0,
      };
    }
  }

  /**
   * Update trend data
   */
  private updateTrends(report: SyntheticTestReport): void {
    const now = new Date();

    // Add new data points
    this.metrics.trends.successRateHistory.push({
      timestamp: now,
      value: report.summary.successRate,
    });

    this.metrics.trends.performanceHistory.push({
      timestamp: now,
      value: report.summary.averageDuration,
    });

    const errorRate =
      report.summary.totalTests > 0
        ? report.summary.failedTests / report.summary.totalTests
        : 0;

    this.metrics.trends.errorRateHistory.push({
      timestamp: now,
      value: errorRate,
    });

    // Keep only last 100 data points for each trend
    const maxPoints = 100;
    this.metrics.trends.successRateHistory =
      this.metrics.trends.successRateHistory.slice(-maxPoints);
    this.metrics.trends.performanceHistory =
      this.metrics.trends.performanceHistory.slice(-maxPoints);
    this.metrics.trends.errorRateHistory =
      this.metrics.trends.errorRateHistory.slice(-maxPoints);
  }

  /**
   * Update user type metrics
   */
  private updateUserTypeMetrics(report: SyntheticTestReport): void {
    // This would need to be enhanced with actual user type mapping
    // For now, we'll create placeholder metrics
    for (const userType of Object.values(SyntheticUserType)) {
      const userResults = report.detailedResults.filter(
        (r) => r.userId.includes(userType) // Simple heuristic
      );

      const successCount = userResults.filter((r) => r.success).length;
      const averageSessionDuration =
        userResults.length > 0
          ? userResults.reduce((sum, r) => sum + r.duration, 0) /
            userResults.length
          : 0;

      const errorCount = userResults.reduce(
        (sum, r) => sum + r.errors.length,
        0
      );

      this.metrics.userTypes[userType] = {
        averageSessionDuration,
        errorCount,
        successRate:
          userResults.length > 0 ? successCount / userResults.length : 0,
        testCount: userResults.length,
      };
    }
  }
}

/**
 * Singleton dashboard instance
 */
export const syntheticDashboard = new SyntheticDashboard();

/**
 * Utility functions for dashboard integration
 */
export function createDashboardWidget(
  containerId: string,
  metricPath: string
): () => void {
  const container = document.getElementById(containerId);
  if (!container) {
    throw new Error(`Container ${containerId} not found`);
  }

  return syntheticDashboard.subscribe((metrics) => {
    const value = getNestedValue(metrics, metricPath);
    container.textContent = formatMetricValue(value, metricPath);
  });
}

function getNestedValue(obj: any, path: string): any {
  return path.split(".").reduce((current, key) => current?.[key], obj);
}

function formatMetricValue(value: any, metricPath: string): string {
  if (typeof value === "number") {
    if (metricPath.includes("Rate") || metricPath.includes("rate")) {
      return `${(value * 100).toFixed(1)}%`;
    }
    if (metricPath.includes("Time") || metricPath.includes("Duration")) {
      return `${Math.round(value)}ms`;
    }
    return value.toString();
  }
  return String(value);
}

/**
 * React hook for dashboard metrics
 */
export function useSyntheticDashboard() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(true);

  useEffect(() => {
    setMetrics(syntheticDashboard.getMetrics());
    setIsLoading(false);

    return syntheticDashboard.subscribe((newMetrics) => {
      setMetrics(newMetrics);
    });
  }, []);

  const subscribe = useCallback(
    (callback: (metrics: DashboardMetrics) => void) => {
      return syntheticDashboard.subscribe(callback);
    },
    []
  );

  const unsubscribe = useCallback((unsubscribeFn: () => void) => {
    unsubscribeFn();
  }, []);

  return {
    alerts: metrics?.alerts || [],
    isConnected,
    isLoading,
    metrics,
    subscribe,
    unsubscribe,
  };
}
