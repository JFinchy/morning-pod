"use client";

import { useEffect } from "react";

import { performanceMonitor } from "@/lib/utils/performance";

export function PerformanceMonitor() {
  useEffect(() => {
    // Initialize performance monitoring
    if (typeof window !== "undefined") {
      // Track initial page load
      performanceMonitor.trackPageView(window.location.pathname);

      // Track bundle size on initial load
      setTimeout(() => {
        performanceMonitor.trackBundleSize();
      }, 2000);

      // Debug performance in development
      if (process.env.NODE_ENV === "development") {
        // Add keyboard shortcut to view performance summary
        const handleKeyPress = (event: KeyboardEvent) => {
          if (event.ctrlKey && event.shiftKey && event.key === "P") {
            performanceMonitor.debugPerformance();
          }
        };

        window.addEventListener("keydown", handleKeyPress);

        // Cleanup
        return () => {
          window.removeEventListener("keydown", handleKeyPress);
        };
      }
    }
  }, []);

  return null; // This component doesn't render anything
}
