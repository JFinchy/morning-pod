// Performance monitoring utilities for Morning Pod

interface PerformanceMetric {
  name: string;
  timestamp: number;
  unit: string;
  url?: string;
  value: number;
}

interface UserInteraction {
  action: string;
  duration?: number;
  metadata?: Record<string, unknown>;
  target: string;
  timestamp: number;
}

class PerformanceMonitor {
  private interactions: UserInteraction[] = [];
  private isEnabled: boolean;
  private metrics: PerformanceMetric[] = [];

  constructor() {
    this.isEnabled = typeof window !== "undefined" && "performance" in window;
    this.initializeWebVitals();
  }

  // Performance debugging in development
  debugPerformance() {
    if (process.env.NODE_ENV !== "development") return;

    console.group("🚀 Performance Summary");
    console.table(this.getPerformanceSummary());
    console.log("Recent metrics:", this.metrics.slice(-10));
    console.log("Recent interactions:", this.interactions.slice(-10));
    console.groupEnd();
  }

  // Get performance summary
  getPerformanceSummary() {
    const vitals = {
      CLS: this.getLatestMetric("CLS"),
      FCP: this.getLatestMetric("FCP"),
      FID: this.getLatestMetric("FID"),
      LCP: this.getLatestMetric("LCP"),
      TTI: this.getLatestMetric("TTI"),
    };

    const tRPCMetrics = this.metrics.filter((m) => m.name.startsWith("tRPC."));
    const averageTRPCTime =
      tRPCMetrics.length > 0
        ? tRPCMetrics.reduce((sum, m) => sum + m.value, 0) / tRPCMetrics.length
        : 0;

    return {
      tRPCPerformance: {
        averageQueryTime: Math.round(averageTRPCTime),
        totalQueries: tRPCMetrics.length,
      },
      userInteractions: this.interactions.length,
      vitals,
    };
  }

  // Record custom metrics
  recordMetric(name: string, value: number, unit: string, url?: string) {
    const metric: PerformanceMetric = {
      name,
      timestamp: Date.now(),
      unit,
      url:
        url ||
        (typeof window !== "undefined" ? window.location.pathname : undefined),
      value,
    };

    this.metrics.push(metric);

    // Log in development
    if (process.env.NODE_ENV === "development") {
      console.log(`📊 ${name}: ${value}${unit}`, metric);
    }

    // In production, you might send to analytics service
    if (process.env.NODE_ENV === "production") {
      this.sendMetricToAnalytics(metric);
    }
  }

  // Bundle size tracking
  trackBundleSize() {
    if (!this.isEnabled) return;

    // Track resource loading times
    const resources = performance.getEntriesByType(
      "resource"
    ) as PerformanceResourceTiming[];

    let totalJSSize = 0;
    let totalCSSSize = 0;

    for (const resource of resources) {
      if (resource.name.endsWith(".js")) {
        totalJSSize += resource.transferSize || 0;
        this.recordMetric("resource.js", resource.duration, "ms");
      } else if (resource.name.endsWith(".css")) {
        totalCSSSize += resource.transferSize || 0;
        this.recordMetric("resource.css", resource.duration, "ms");
      }
    }

    if (totalJSSize > 0) {
      this.recordMetric("bundle.js_size", totalJSSize / 1024, "KB");
    }
    if (totalCSSSize > 0) {
      this.recordMetric("bundle.css_size", totalCSSSize / 1024, "KB");
    }
  }

  // Track episode interactions
  trackEpisodeInteraction(
    action: "download" | "pause" | "play" | "skip",
    episodeId: string
  ) {
    this.trackUserInteraction("episode_interaction", episodeId, { action });
  }

  // Track generation events
  trackGenerationEvent(
    action: "complete" | "error" | "start",
    episodeId?: string
  ) {
    this.trackUserInteraction("episode_generation", episodeId || "unknown", {
      action,
    });
  }

  // Track page navigation
  trackPageView(path: string) {
    this.recordMetric("page_view", performance.now(), "ms", path);
    this.trackUserInteraction("page_view", path);
  }

  // Track tRPC query performance
  trackTRPCQuery(
    procedure: string,
    duration: number,
    status: "error" | "success"
  ) {
    this.recordMetric(`tRPC.${procedure}`, duration, "ms");
    this.trackUserInteraction("tRPC_query", procedure, { duration, status });
  }

  // Track user interactions
  trackUserInteraction(
    action: string,
    target: string,
    metadata?: Record<string, unknown>
  ) {
    const interaction: UserInteraction = {
      action,
      metadata,
      target,
      timestamp: Date.now(),
    };

    this.interactions.push(interaction);

    if (process.env.NODE_ENV === "development") {
      console.log(`👤 User interaction: ${action} on ${target}`, interaction);
    }
  }

  private getLatestMetric(name: string) {
    const metric = this.metrics
      .filter((m) => m.name === name)
      .sort((a, b) => b.timestamp - a.timestamp)[0];

    return metric ? Math.round(metric.value) : null;
  }

  // Core Web Vitals tracking
  private initializeWebVitals() {
    if (!this.isEnabled) return;

    // Track First Contentful Paint (FCP)
    this.observePerformanceEntry("paint", (entry) => {
      if (entry.name === "first-contentful-paint") {
        this.recordMetric("FCP", entry.startTime, "ms");
      }
    });

    // Track Largest Contentful Paint (LCP)
    this.observePerformanceEntry("largest-contentful-paint", (entry) => {
      this.recordMetric("LCP", entry.startTime, "ms");
    });

    // Track First Input Delay (FID)
    this.observePerformanceEntry("first-input", (entry) => {
      const fidEntry = entry as PerformanceEventTiming;
      const fid = fidEntry.processingStart - fidEntry.startTime;
      this.recordMetric("FID", fid, "ms");
    });

    // Track Cumulative Layout Shift (CLS)
    this.observePerformanceEntry("layout-shift", (entry) => {
      const clsEntry = entry as PerformanceEntry & {
        hadRecentInput: boolean;
        value: number;
      };
      if (!clsEntry.hadRecentInput) {
        this.recordMetric("CLS", clsEntry.value, "score");
      }
    });

    // Track Time to Interactive (TTI) approximation
    this.trackTimeToInteractive();
  }

  private observePerformanceEntry(
    type: string,
    callback: (entry: PerformanceEntry) => void
  ) {
    if (!this.isEnabled || !window.PerformanceObserver) return;

    try {
      const observer = new PerformanceObserver((list) => {
        list.getEntries().forEach(callback);
      });
      observer.observe({ buffered: true, type });
    } catch (error) {
      console.warn(`Failed to observe ${type}:`, error);
    }
  }

  private sendMetricToAnalytics(metric: PerformanceMetric) {
    // Placeholder for analytics service integration
    // Example: analytics.track('performance_metric', metric);
  }

  private trackTimeToInteractive() {
    if (!this.isEnabled) return;

    // Simple TTI approximation - when page becomes interactive
    const checkInteractive = () => {
      if (document.readyState === "complete") {
        this.recordMetric("TTI", performance.now(), "ms");
      } else {
        setTimeout(checkInteractive, 100);
      }
    };

    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", checkInteractive);
    } else {
      checkInteractive();
    }
  }
}

// Singleton instance
export const performanceMonitor = new PerformanceMonitor();

// React hook for performance tracking
export function usePerformanceTracking() {
  const trackInteraction = (
    action: string,
    target: string,
    metadata?: Record<string, unknown>
  ) => {
    performanceMonitor.trackUserInteraction(action, target, metadata);
  };

  const trackMetric = (name: string, value: number, unit: string) => {
    performanceMonitor.recordMetric(name, value, unit);
  };

  return {
    getPerformanceSummary:
      performanceMonitor.getPerformanceSummary.bind(performanceMonitor),
    trackEpisodeInteraction:
      performanceMonitor.trackEpisodeInteraction.bind(performanceMonitor),
    trackGenerationEvent:
      performanceMonitor.trackGenerationEvent.bind(performanceMonitor),
    trackInteraction,
    trackMetric,
  };
}

// Utility functions
export function measureAsyncOperation<T>(
  operation: () => Promise<T>,
  operationName: string
): Promise<T> {
  const start = performance.now();

  return operation().finally(() => {
    const duration = performance.now() - start;
    performanceMonitor.recordMetric(operationName, duration, "ms");
  });
}

export function measureSyncOperation<T>(
  operation: () => T,
  operationName: string
): T {
  const start = performance.now();
  const result = operation();
  const duration = performance.now() - start;

  performanceMonitor.recordMetric(operationName, duration, "ms");
  return result;
}
