/**
 * Performance audit utilities
 */

export interface PerformanceMetrics {
  pageLoadTime: number;
  timeToFirstByte: number;
  domContentLoaded: number;
  largestContentfulPaint?: number;
  firstInputDelay?: number;
  cumulativeLayoutShift?: number;
}

/**
 * Collect Web Vitals and performance metrics
 */
export function collectPerformanceMetrics(): PerformanceMetrics | null {
  if (typeof window === "undefined" || !window.performance) {
    return null;
  }

  const navigation = window.performance.getEntriesByType(
    "navigation"
  )[0] as PerformanceNavigationTiming;

  if (!navigation) {
    return null;
  }

  const metrics: PerformanceMetrics = {
    pageLoadTime: navigation.loadEventEnd - navigation.loadEventStart,
    timeToFirstByte: navigation.responseStart - navigation.requestStart,
    domContentLoaded:
      navigation.domContentLoadedEventEnd -
      navigation.domContentLoadedEventStart,
  };

  // Collect Core Web Vitals if available
  if ("PerformanceObserver" in window) {
    // LCP - Largest Contentful Paint
    try {
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1] as any;
        metrics.largestContentfulPaint = lastEntry.startTime;
      });
      lcpObserver.observe({ type: "largest-contentful-paint", buffered: true });
    } catch (e) {
      // Observer not supported
    }

    // FID - First Input Delay
    try {
      const fidObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry: any) => {
          metrics.firstInputDelay = entry.processingStart - entry.startTime;
        });
      });
      fidObserver.observe({ type: "first-input", buffered: true });
    } catch (e) {
      // Observer not supported
    }

    // CLS - Cumulative Layout Shift
    try {
      let clsValue = 0;
      const clsObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry: any) => {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
          }
        });
        metrics.cumulativeLayoutShift = clsValue;
      });
      clsObserver.observe({ type: "layout-shift", buffered: true });
    } catch (e) {
      // Observer not supported
    }
  }

  return metrics;
}

/**
 * Log performance metrics for debugging
 */
export function logPerformanceMetrics(): void {
  const metrics = collectPerformanceMetrics();

  if (!metrics) {
    console.warn("Performance metrics not available");
    return;
  }

  console.group("🏃 Performance Metrics");
  console.log("Page Load Time:", `${metrics.pageLoadTime.toFixed(2)}ms`);
  console.log("Time to First Byte:", `${metrics.timeToFirstByte.toFixed(2)}ms`);
  console.log(
    "DOM Content Loaded:",
    `${metrics.domContentLoaded.toFixed(2)}ms`
  );

  if (metrics.largestContentfulPaint) {
    console.log(
      "Largest Contentful Paint:",
      `${metrics.largestContentfulPaint.toFixed(2)}ms`
    );
  }

  if (metrics.firstInputDelay) {
    console.log(
      "First Input Delay:",
      `${metrics.firstInputDelay.toFixed(2)}ms`
    );
  }

  if (metrics.cumulativeLayoutShift) {
    console.log(
      "Cumulative Layout Shift:",
      metrics.cumulativeLayoutShift.toFixed(4)
    );
  }

  console.groupEnd();
}

/**
 * Performance recommendations based on metrics
 */
export function getPerformanceRecommendations(
  metrics: PerformanceMetrics
): string[] {
  const recommendations: string[] = [];

  if (metrics.pageLoadTime > 3000) {
    recommendations.push(
      "Page load time is slow (>3s). Consider code splitting and lazy loading."
    );
  }

  if (metrics.timeToFirstByte > 600) {
    recommendations.push(
      "Time to First Byte is slow (>600ms). Check server response times."
    );
  }

  if (metrics.largestContentfulPaint && metrics.largestContentfulPaint > 2500) {
    recommendations.push(
      "Largest Contentful Paint is slow (>2.5s). Optimize images and critical resources."
    );
  }

  if (metrics.firstInputDelay && metrics.firstInputDelay > 100) {
    recommendations.push(
      "First Input Delay is slow (>100ms). Reduce JavaScript execution time."
    );
  }

  if (metrics.cumulativeLayoutShift && metrics.cumulativeLayoutShift > 0.1) {
    recommendations.push(
      "Cumulative Layout Shift is high (>0.1). Set explicit dimensions for images and embeds."
    );
  }

  return recommendations;
}

/**
 * Debounced performance tracking for development
 */
export function enablePerformanceMonitoring(): void {
  if (process.env.NODE_ENV !== "development") {
    return;
  }

  let timeoutId: NodeJS.Timeout;

  const track = () => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      const metrics = collectPerformanceMetrics();
      if (metrics) {
        const recommendations = getPerformanceRecommendations(metrics);
        if (recommendations.length > 0) {
          console.warn("⚠️ Performance Recommendations:", recommendations);
        }
      }
    }, 1000);
  };

  // Track on page load
  if (document.readyState === "complete") {
    track();
  } else {
    window.addEventListener("load", track);
  }

  // Track on route changes (for SPA)
  let currentPath = window.location.pathname;
  const checkForRouteChange = () => {
    if (window.location.pathname !== currentPath) {
      currentPath = window.location.pathname;
      track();
    }
  };

  // Poll for route changes
  setInterval(checkForRouteChange, 1000);
}
