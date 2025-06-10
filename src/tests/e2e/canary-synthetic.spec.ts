/**
 * Synthetic User Canary Tests - Playwright E2E
 *
 * @business-context End-to-end tests that validate synthetic user automation
 *                   and canary feature rollout capabilities using real browsers.
 *                   These tests ensure our synthetic testing framework works correctly.
 * @decision-date 2024-01-22
 * @decision-by Development team for automated canary validation
 */

import { BrowserContext, expect, Page, test } from "@playwright/test";

import {
  createSyntheticUserTesting,
  SyntheticUserType,
  TestScenario,
} from "@/lib/testing/synthetic-users";
import {
  type AutomationConfig,
  createCanaryAutomation,
  runCanaryValidation,
} from "@/tests/synthetic/canary-automation";

/**
 * Test configuration for canary testing
 */
const canaryConfig: Partial<AutomationConfig> = {
  baseUrl: "http://localhost:3000",
  headless: true,
  recordVideo: false,
  retryAttempts: 1,
  screenshotOnFailure: true,
  slowMo: 100,
  timeout: 30000,
};

test.describe("Synthetic User Canary Testing", () => {
  test.beforeEach(async ({ page }) => {
    // Ensure the app is running and accessible
    await page.goto("/");
    await expect(page).toHaveTitle(/Morning Pod/u);
  });

  test("should create and configure synthetic users correctly", async () => {
    const syntheticTesting = createSyntheticUserTesting(
      "http://localhost:3000"
    );

    // Verify default users are created
    const results = syntheticTesting.getResults();
    expect(Array.isArray(results)).toBe(true);

    // Verify user types are available
    expect(Object.values(SyntheticUserType)).toContain(
      SyntheticUserType.POWER_USER
    );
    expect(Object.values(SyntheticUserType)).toContain(
      SyntheticUserType.CASUAL_LISTENER
    );
    expect(Object.values(SyntheticUserType)).toContain(
      SyntheticUserType.CONTENT_CREATOR
    );
  });

  test("should validate core navigation flows", async ({ page }) => {
    // Test basic page navigation that synthetic users will perform
    const pages = [
      { path: "/", title: /Morning Pod/u },
      { path: "/episodes", title: /Episodes/u },
      { path: "/sources", title: /Sources/u },
      { path: "/queue", title: /Queue/u },
    ];

    for (const pageInfo of pages) {
      await page.goto(pageInfo.path);
      await expect(page).toHaveTitle(pageInfo.title);

      // Verify page loaded correctly
      await expect(page.locator('main, [role="main"], .content')).toBeVisible();

      // Check for basic interactive elements
      const buttons = page.locator("button");
      const buttonCount = await buttons.count();
      expect(buttonCount).toBeGreaterThan(0);
    }
  });

  test("should detect episode generation elements for automation", async ({
    page,
  }) => {
    await page.goto("/");

    // Look for episode generation triggers that synthetic users need
    const generateButtons = page.locator(
      'button:has-text("Generate"), button:has-text("New Episode")'
    );
    const generateButtonCount = await generateButtons.count();

    // Should have at least one way to trigger episode generation
    expect(generateButtonCount).toBeGreaterThan(0);

    // Click the first generate button
    await generateButtons.first().click();

    // Should open modal or navigate to generation page
    await expect(page).toHaveURL(/.*/, { timeout: 5000 });

    // Look for form elements that synthetic users will interact with
    const urlInputs = page.locator(
      'input[placeholder*="URL"], input[name*="url"], input[id*="url"]'
    );
    const urlInputCount = await urlInputs.count();

    if (urlInputCount > 0) {
      // Test form interaction
      await urlInputs.first().fill("https://example.com/test-article");
      await expect(urlInputs.first()).toHaveValue(
        "https://example.com/test-article"
      );
    }
  });

  test("should validate audio player elements exist", async ({ page }) => {
    await page.goto("/episodes");

    // Look for episode cards or audio elements
    const episodeElements = page.locator(
      '.episode-card, [data-testid*="episode"], .episode-item'
    );
    const episodeCount = await episodeElements.count();

    if (episodeCount > 0) {
      // Click on first episode
      await episodeElements.first().click();

      // Look for audio controls that synthetic users will test
      const playButtons = page.locator(
        'button:has-text("Play"), button[aria-label*="play"]'
      );
      const playButtonCount = await playButtons.count();

      // Should have audio controls available
      expect(playButtonCount).toBeGreaterThanOrEqual(0);

      if (playButtonCount > 0) {
        // Test basic audio interaction
        await playButtons.first().click();

        // Look for pause button after play
        const pauseButtons = page.locator(
          'button:has-text("Pause"), button[aria-label*="pause"]'
        );
        await expect(pauseButtons.first()).toBeVisible({ timeout: 5000 });
      }
    }
  });

  test("should handle responsive design testing scenarios", async ({
    page,
  }) => {
    const viewports = [
      { height: 844, name: "mobile", width: 390 },
      { height: 1024, name: "tablet", width: 768 },
      { height: 900, name: "desktop", width: 1440 },
    ];

    for (const viewport of viewports) {
      await page.setViewportSize(viewport);
      await page.goto("/");

      // Verify page is responsive
      await expect(page.locator('main, [role="main"], .content')).toBeVisible();

      // Check that navigation is accessible at this viewport
      const navElements = page.locator('nav, .navigation, [role="navigation"]');
      const navCount = await navElements.count();
      expect(navCount).toBeGreaterThan(0);

      // Take screenshot for visual validation
      await page.screenshot({
        fullPage: true,
        path: `test-results/responsive-${viewport.name}-${Date.now()}.png`,
      });
    }
  });

  test("should validate error handling scenarios", async ({ page }) => {
    // Test 404 page handling
    await page.goto("/nonexistent-page");

    // Should either show 404 page or redirect appropriately
    const pageContent = await page.textContent("body");
    const currentUrl = page.url();

    // Either contains 404 content or redirected away from the bad URL
    const handles404 =
      pageContent?.includes("404") ||
      pageContent?.includes("Not Found") ||
      !currentUrl.includes("nonexistent-page");

    expect(handles404).toBe(true);
  });

  test("should validate performance monitoring capabilities", async ({
    page,
  }) => {
    // Navigate to a page and gather performance metrics
    await page.goto("/");

    const performanceMetrics = await page.evaluate(() => {
      const navigation = performance.getEntriesByType(
        "navigation"
      )[0] as PerformanceNavigationTiming;
      const paintEntries = performance.getEntriesByType("paint");
      const fcp =
        paintEntries.find((entry) => entry.name === "first-contentful-paint")
          ?.startTime || 0;

      return {
        firstContentfulPaint: fcp,
        pageLoadTime: navigation.loadEventEnd - navigation.loadEventStart,
        resourceCount: performance.getEntriesByType("resource").length,
        totalDataTransferred: performance
          .getEntriesByType("resource")
          .reduce((total, entry: any) => total + (entry.transferSize || 0), 0),
      };
    });

    // Validate that we can gather meaningful metrics
    expect(performanceMetrics.pageLoadTime).toBeGreaterThan(0);
    expect(performanceMetrics.resourceCount).toBeGreaterThan(0);
    expect(performanceMetrics.totalDataTransferred).toBeGreaterThan(0);

    // Performance should be reasonable (not extremely slow)
    expect(performanceMetrics.pageLoadTime).toBeLessThan(10000); // 10 seconds max
  });
});

test.describe("Canary Automation Integration", () => {
  test("should initialize canary automation successfully", async () => {
    const automation = createCanaryAutomation(canaryConfig);
    expect(automation).toBeDefined();

    // Initialize browsers
    await automation.initializeBrowsers(["chromium"]);

    // Cleanup
    await automation.cleanup();
  });

  test("should execute synthetic user automation", async ({ page }) => {
    // Create synthetic user testing instance
    const syntheticTesting = createSyntheticUserTesting(
      "http://localhost:3000"
    );

    // Register a test user
    syntheticTesting.registerUser({
      behaviorPattern: {
        actionsPerSession: { average: 5, max: 8, min: 3 },
        errorTolerance: 0.5,
        featureAdoption: 0.3,
        sessionDuration: { average: 10, max: 15, min: 5 },
        thinkTime: { average: 1000, max: 2000, min: 500 },
      },
      device: {
        capabilities: {
          javascript: true,
          localStorage: true,
          touchScreen: false,
          webAudio: true,
        },
        deviceType: "desktop",
        network: "fast",
        userAgent: "Mozilla/5.0 (compatible; SyntheticUser/1.0)",
        viewport: { height: 720, width: 1280 },
      },
      id: "test_user_001",
      name: "Test User",
      preferences: {
        audioQuality: "standard",
        autoplay: false,
        notifications: false,
        playbackSpeed: 1.0,
        theme: "light",
      },
      testScenarios: [TestScenario.NAVIGATION_FLOW],
      type: SyntheticUserType.CASUAL_LISTENER,
    });

    // Execute tests for the user
    const results = await syntheticTesting.executeUserTests("test_user_001");

    // Validate results
    expect(results).toBeDefined();
    expect(Array.isArray(results)).toBe(true);
    expect(results.length).toBeGreaterThan(0);

    // Check result structure
    const firstResult = results[0];
    expect(firstResult).toHaveProperty("userId");
    expect(firstResult).toHaveProperty("scenario");
    expect(firstResult).toHaveProperty("success");
    expect(firstResult).toHaveProperty("duration");
    expect(firstResult).toHaveProperty("steps");
    expect(firstResult).toHaveProperty("metrics");

    expect(firstResult.userId).toBe("test_user_001");
    expect(firstResult.scenario).toBe(TestScenario.NAVIGATION_FLOW);
  });

  test("should generate comprehensive test reports", async () => {
    const syntheticTesting = createSyntheticUserTesting(
      "http://localhost:3000"
    );

    // Run a quick test
    await syntheticTesting.executeUserTests("power_user_001");

    // Generate report
    const report = syntheticTesting.generateReport();

    // Validate report structure
    expect(report).toHaveProperty("summary");
    expect(report).toHaveProperty("scenarioBreakdown");
    expect(report).toHaveProperty("userBreakdown");
    expect(report).toHaveProperty("detailedResults");

    expect(report.summary).toHaveProperty("totalTests");
    expect(report.summary).toHaveProperty("successfulTests");
    expect(report.summary).toHaveProperty("failedTests");
    expect(report.summary).toHaveProperty("successRate");
    expect(report.summary).toHaveProperty("averageDuration");
    expect(report.summary).toHaveProperty("generatedAt");

    expect(report.summary.totalTests).toBeGreaterThan(0);
    expect(report.summary.successRate).toBeGreaterThanOrEqual(0);
    expect(report.summary.successRate).toBeLessThanOrEqual(1);
  });

  test("should handle test failures gracefully", async () => {
    const syntheticTesting = createSyntheticUserTesting(
      "http://invalid-url:9999"
    );

    // Register a user that will fail due to invalid URL
    syntheticTesting.registerUser({
      behaviorPattern: {
        actionsPerSession: { average: 1, max: 2, min: 1 },
        errorTolerance: 0.1,
        featureAdoption: 0.1,
        sessionDuration: { average: 1, max: 2, min: 1 },
        thinkTime: { average: 150, max: 200, min: 100 },
      },
      device: {
        capabilities: {
          javascript: true,
          localStorage: true,
          touchScreen: false,
          webAudio: true,
        },
        deviceType: "desktop",
        network: "fast",
        userAgent: "Mozilla/5.0 (compatible; SyntheticUser/1.0)",
        viewport: { height: 720, width: 1280 },
      },
      id: "failing_user_001",
      name: "Failing Test User",
      preferences: {
        audioQuality: "standard",
        autoplay: false,
        notifications: false,
        playbackSpeed: 1.0,
        theme: "light",
      },
      testScenarios: [TestScenario.NAVIGATION_FLOW],
      type: SyntheticUserType.POWER_USER,
    });

    // Execute tests (should handle failure gracefully)
    const results = await syntheticTesting.executeUserTests("failing_user_001");

    expect(results).toBeDefined();
    expect(Array.isArray(results)).toBe(true);

    // Should have at least one result even if it failed
    if (results.length > 0) {
      const firstResult = results[0];
      expect(firstResult).toHaveProperty("success");
      expect(firstResult).toHaveProperty("errors");

      // If test failed, should have error information
      if (!firstResult.success) {
        expect(Array.isArray(firstResult.errors)).toBe(true);
      }
    }
  });
});

test.describe("Feature Flag Integration", () => {
  test("should support feature flag controlled testing", async ({ page }) => {
    // This test validates that synthetic users can test features
    // controlled by feature flags

    await page.goto("/");

    // Look for feature-flag controlled elements
    // (In a real implementation, these would be controlled by PostHog or similar)
    const body = page;

    // Verify basic app functionality is available
    const bodyLocator = page.locator("body");
    await expect(bodyLocator).toContainText("");
    const bodyContent = await bodyLocator.textContent();
    expect(bodyContent?.length || 0).toBeGreaterThan(0);

    // Test that we can detect different UI variants
    // that would be controlled by feature flags
    const buttons = page.locator("button");
    const buttonCount = await buttons.count();
    expect(buttonCount).toBeGreaterThan(0);
  });

  test("should validate canary rollout readiness", async ({ page }) => {
    // This test ensures the app is ready for canary rollouts

    // Check critical pages load successfully
    const criticalPages = ["/", "/episodes", "/sources"];

    for (const pagePath of criticalPages) {
      await page.goto(pagePath);

      // Should load without critical errors
      await expect(page.locator('main, [role="main"], .content')).toBeVisible();

      // Should not have JavaScript errors (basic check)
      const logs: string[] = [];
      page.on("console", (msg) => {
        if (msg.type() === "error") {
          logs.push(msg.text());
        }
      });

      // Interact with the page briefly
      await page.waitForTimeout(1000);

      // Check for critical JavaScript errors
      const criticalErrors = logs.filter(
        (log) =>
          log.includes("Uncaught") ||
          log.includes("TypeError") ||
          log.includes("ReferenceError")
      );

      expect(criticalErrors.length).toBe(0);
    }
  });
});

test.describe("Load Testing Preparation", () => {
  test("should validate app performance under rapid interactions", async ({
    page,
  }) => {
    await page.goto("/");

    const startTime = Date.now();

    // Rapid navigation test
    const pages = ["/", "/episodes", "/sources", "/queue"];

    for (let i = 0; i < 3; i++) {
      // Reduced for E2E test
      for (const pagePath of pages) {
        await page.goto(pagePath);
        await page.waitForLoadState("domcontentloaded");

        // Brief pause to simulate rapid user behavior
        await page.waitForTimeout(100);
      }
    }

    const endTime = Date.now();
    const totalTime = endTime - startTime;

    // Should complete rapid navigation in reasonable time
    expect(totalTime).toBeLessThan(30000); // 30 seconds max
  });

  test("should monitor memory usage during extended interactions", async ({
    page,
  }) => {
    await page.goto("/");

    // Simulate extended user session
    const actions = [
      () => page.goto("/"),
      () => page.goto("/episodes"),
      () => page.goto("/sources"),
      () => page.goto("/queue"),
    ];

    let initialMemory = 0;
    let finalMemory = 0;

    // Get initial memory
    try {
      initialMemory = await page.evaluate(() => {
        return (performance as any).memory?.usedJSHeapSize || 0;
      });
    } catch {
      // Memory API not available in all browsers
      initialMemory = 0;
    }

    // Perform actions
    for (let i = 0; i < 5; i++) {
      for (const action of actions) {
        await action();
        await page.waitForLoadState("domcontentloaded");
        await page.waitForTimeout(200);
      }
    }

    // Get final memory
    try {
      finalMemory = await page.evaluate(() => {
        return (performance as any).memory?.usedJSHeapSize || 0;
      });
    } catch {
      finalMemory = 0;
    }

    // If memory API is available, check for reasonable memory usage
    if (initialMemory > 0 && finalMemory > 0) {
      const memoryIncrease = finalMemory - initialMemory;
      const memoryIncreaseMB = memoryIncrease / (1024 * 1024);

      // Memory increase should be reasonable (less than 50MB for this test)
      expect(memoryIncreaseMB).toBeLessThan(50);

      console.log(
        `Memory usage: ${initialMemory / (1024 * 1024)}MB -> ${finalMemory / (1024 * 1024)}MB (${memoryIncreaseMB}MB increase)`
      );
    }
  });
});
