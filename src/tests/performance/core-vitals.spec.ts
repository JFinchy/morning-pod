import { expect, test } from "@playwright/test";

test.describe("Performance - Core Web Vitals (POC)", () => {
  test("should meet Core Web Vitals thresholds", async ({ page }) => {
    // Navigate to homepage
    await page.goto("/");

    // Wait for page to be fully loaded
    await page.waitForLoadState("networkidle");

    // Collect Core Web Vitals
    const webVitals = await page.evaluate(() => {
      return new Promise((resolve) => {
        const vitals: Record<string, number> = {};

        // First Contentful Paint (FCP)
        new PerformanceObserver((entryList) => {
          for (const entry of entryList.getEntries()) {
            if (entry.name === "first-contentful-paint") {
              vitals.fcp = entry.startTime;
            }
          }
        }).observe({ entryTypes: ["paint"] });

        // Largest Contentful Paint (LCP)
        new PerformanceObserver((entryList) => {
          const entries = entryList.getEntries();
          const lastEntry = entries.at(-1);
          if (lastEntry) {
            vitals.lcp = lastEntry.startTime;
          }
        }).observe({ entryTypes: ["largest-contentful-paint"] });

        // Cumulative Layout Shift (CLS)
        let cumulativeLayoutShift = 0;
        new PerformanceObserver((entryList) => {
          for (const entry of entryList.getEntries()) {
            const layoutShiftEntry = entry as unknown as {
              hadRecentInput?: boolean;
              value: number;
            };
            if (!layoutShiftEntry.hadRecentInput) {
              cumulativeLayoutShift += layoutShiftEntry.value;
            }
          }
          vitals.cls = cumulativeLayoutShift;
        }).observe({ entryTypes: ["layout-shift"] });

        // Time to Interactive (TTI) - simplified estimation
        vitals.tti = performance.now();

        // Return results after a short delay to collect metrics
        setTimeout(() => resolve(vitals), 3000);
      });
    });

    const vitals = webVitals as Record<string, number>;
    console.log("Web Vitals:", vitals);

    // Assert Core Web Vitals thresholds
    // FCP should be < 1.8s (good), < 3s (needs improvement)
    if (vitals.fcp) {
      expect(vitals.fcp).toBeLessThan(3000);
    }

    // LCP should be < 2.5s (good), < 4s (needs improvement)
    if (vitals.lcp) {
      expect(vitals.lcp).toBeLessThan(4000);
    }

    // CLS should be < 0.1 (good), < 0.25 (needs improvement)
    if (vitals.cls !== undefined) {
      expect(vitals.cls).toBeLessThan(0.25);
    }

    // TTI should be reasonable for a podcast app
    if (vitals.tti) {
      expect(vitals.tti).toBeLessThan(5000);
    }
  });

  test("should load homepage within performance budget", async ({ page }) => {
    const startTime = Date.now();

    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");

    const domLoadTime = Date.now() - startTime;

    // DOM should load within 2 seconds
    expect(domLoadTime).toBeLessThan(2000);
    console.log(`DOM Load Time: ${domLoadTime}ms`);
  });

  test("should have reasonable resource sizes", async ({ page }) => {
    const responses: unknown[] = [];

    page.on("response", (response) => {
      responses.push({
        size: response.headers()["content-length"] || 0,
        status: response.status(),
        url: response.url(),
      } as unknown);
    });

    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Analyze resource sizes
    const totalSize = responses.reduce((sum: number, response) => {
      const responseObj = response as { size: number | string };
      return sum + (Number.parseInt(String(responseObj.size)) || 0);
    }, 0);

    console.log(`Total Resource Size: ${totalSize} bytes`);
    console.log(`Number of Requests: ${responses.length}`);

    // Should have reasonable resource budget
    expect(responses.length).toBeLessThan(50); // Not too many requests

    // Log large resources for optimization
    const largeResources = responses.filter((r) => {
      const responseObj = r as { size: number | string };
      return Number.parseInt(String(responseObj.size)) > 100000;
    });
    if (largeResources.length > 0) {
      console.log("Large Resources (>100KB):", largeResources);
    }
  });

  test("should render efficiently across viewport sizes", async ({ page }) => {
    const viewports = [
      { height: 667, name: "Mobile", width: 375 },
      { height: 1024, name: "Tablet", width: 768 },
      { height: 1080, name: "Desktop", width: 1920 },
    ];

    for (const viewport of viewports) {
      await page.setViewportSize(viewport);

      const startTime = Date.now();
      await page.goto("/");
      await page.waitForLoadState("domcontentloaded");
      const loadTime = Date.now() - startTime;

      console.log(
        `${viewport.name} (${viewport.width}x${viewport.height}): ${loadTime}ms`
      );

      // Should load reasonably fast on all viewport sizes
      expect(loadTime).toBeLessThan(3000);

      // Main content should be visible
      await expect(page.getByRole("main")).toBeVisible();
    }
  });
});
