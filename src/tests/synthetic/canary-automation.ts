/**
 * Canary Automation with Playwright
 *
 * @business-context Automates synthetic user testing using real browser automation.
 *                   Provides comprehensive validation of canary features before
 *                   exposing them to real users in production.
 * @decision-date 2024-01-22
 * @decision-by Development team for safer feature rollouts
 */

import {
  Browser,
  BrowserContext,
  Page,
  chromium,
  firefox,
  webkit,
} from "playwright";
import {
  SyntheticUserTesting,
  SyntheticUserConfig,
  TestScenario,
  TestExecutionResult,
  TestStepResult,
  TestError,
  PerformanceMetrics,
  createSyntheticUserTesting,
} from "@/lib/testing/synthetic-users";

/**
 * Browser automation configuration
 */
export interface AutomationConfig {
  headless: boolean;
  baseUrl: string;
  timeout: number;
  screenshotOnFailure: boolean;
  recordVideo: boolean;
  slowMo: number; // milliseconds between actions
  retryAttempts: number;
}

/**
 * Browser type options for cross-browser testing
 */
export type BrowserType = "chromium" | "firefox" | "webkit";

/**
 * Real browser automation class for synthetic users
 *
 * @business-context Uses Playwright to simulate actual user interactions
 *                   in real browsers, providing the most accurate testing
 *                   environment possible for feature validation.
 */
export class CanaryAutomation {
  private browsers: Map<BrowserType, Browser> = new Map();
  private contexts: Map<string, BrowserContext> = new Map();
  private pages: Map<string, Page> = new Map();
  private syntheticTesting: SyntheticUserTesting;

  constructor(private config: AutomationConfig) {
    this.syntheticTesting = createSyntheticUserTesting(config.baseUrl);
  }

  /**
   * Initialize browsers for testing
   *
   * @business-context Supports multi-browser testing to ensure compatibility
   *                   across different browser engines and user preferences
   */
  async initializeBrowsers(
    browserTypes: BrowserType[] = ["chromium"]
  ): Promise<void> {
    for (const browserType of browserTypes) {
      let browser: Browser;

      switch (browserType) {
        case "chromium":
          browser = await chromium.launch({
            headless: this.config.headless,
            slowMo: this.config.slowMo,
          });
          break;
        case "firefox":
          browser = await firefox.launch({
            headless: this.config.headless,
            slowMo: this.config.slowMo,
          });
          break;
        case "webkit":
          browser = await webkit.launch({
            headless: this.config.headless,
            slowMo: this.config.slowMo,
          });
          break;
      }

      this.browsers.set(browserType, browser);
    }
  }

  /**
   * Create browser context for a synthetic user
   *
   * @business-context Each user gets an isolated browser context with
   *                   their specific device profile and preferences
   */
  async createUserContext(
    user: SyntheticUserConfig,
    browserType: BrowserType = "chromium"
  ): Promise<void> {
    const browser = this.browsers.get(browserType);
    if (!browser) {
      throw new Error(`Browser ${browserType} not initialized`);
    }

    const contextOptions: any = {
      viewport: user.device.viewport,
      userAgent: user.device.userAgent,
      locale: "en-US",
      timezoneId: "America/New_York",
      permissions: [],
      recordVideo: this.config.recordVideo
        ? {
            dir: `./test-results/videos/${user.id}/`,
            size: user.device.viewport,
          }
        : undefined,
    };

    // Simulate different network conditions
    if (user.device.network === "slow") {
      contextOptions.offline = false;
      // Will set throttling after context creation
    } else if (user.device.network === "offline") {
      contextOptions.offline = true;
    }

    // Device-specific options
    if (user.device.deviceType === "mobile") {
      contextOptions.isMobile = true;
      contextOptions.hasTouch = true;
    }

    const context = await browser.newContext(contextOptions);

    // Set network throttling for slow connections
    if (user.device.network === "slow") {
      await context.route("**/*", async (route) => {
        // Add delay to simulate slow network
        await new Promise((resolve) => setTimeout(resolve, 200));
        await route.continue();
      });
    }

    this.contexts.set(user.id, context);

    // Create page for the user
    const page = await context.newPage();

    // Set up error tracking
    page.on("pageerror", (error) => {
      console.error(`❌ Page error for user ${user.id}:`, error.message);
    });

    page.on("console", (msg) => {
      if (msg.type() === "error") {
        console.error(`❌ Console error for user ${user.id}:`, msg.text());
      }
    });

    this.pages.set(user.id, page);
  }

  /**
   * Execute automated tests for all synthetic users
   *
   * @business-context Runs comprehensive automation across all user types
   *                   to validate feature functionality in real browsers
   */
  async executeAutomatedTests(
    browserTypes: BrowserType[] = ["chromium"]
  ): Promise<Map<string, TestExecutionResult[]>> {
    console.log("🚀 Starting canary automation tests...");

    await this.initializeBrowsers(browserTypes);

    const allResults = new Map<string, TestExecutionResult[]>();

    // Get all registered users
    const users = Array.from(this.syntheticTesting["users"].values());

    for (const user of users) {
      console.log(`🤖 Testing user: ${user.name} (${user.type})`);

      // Test across all specified browsers
      for (const browserType of browserTypes) {
        try {
          await this.createUserContext(user, browserType);
          const results = await this.executeUserAutomation(user);

          const key = `${user.id}_${browserType}`;
          allResults.set(key, results);
        } catch (error) {
          console.error(
            `❌ Failed to test user ${user.id} on ${browserType}:`,
            error
          );
        }
      }
    }

    await this.cleanup();
    console.log("✅ Canary automation tests completed");

    return allResults;
  }

  /**
   * Execute automation for a specific user
   */
  private async executeUserAutomation(
    user: SyntheticUserConfig
  ): Promise<TestExecutionResult[]> {
    const page = this.pages.get(user.id);
    if (!page) {
      throw new Error(`No page found for user ${user.id}`);
    }

    const results: TestExecutionResult[] = [];

    for (const scenario of user.testScenarios) {
      console.log(`  📋 Testing scenario: ${scenario}`);

      try {
        const result = await this.executeScenarioAutomation(
          user,
          scenario,
          page
        );
        results.push(result);

        // Brief pause between scenarios
        await this.sleep(2000);
      } catch (error) {
        console.error(
          `❌ Scenario ${scenario} failed for user ${user.id}:`,
          error
        );

        // Create error result
        results.push({
          userId: user.id,
          scenario,
          startTime: new Date(),
          endTime: new Date(),
          duration: 0,
          success: false,
          steps: [],
          metrics: await this.gatherPageMetrics(page),
          errors: [
            {
              type: "javascript",
              message: error instanceof Error ? error.message : "Unknown error",
              stack: error instanceof Error ? error.stack : undefined,
              timestamp: new Date(),
            },
          ],
          screenshots: [],
        });
      }
    }

    return results;
  }

  /**
   * Execute a specific test scenario with real browser automation
   */
  private async executeScenarioAutomation(
    user: SyntheticUserConfig,
    scenario: TestScenario,
    page: Page
  ): Promise<TestExecutionResult> {
    const startTime = new Date();
    const steps: TestStepResult[] = [];
    const errors: TestError[] = [];
    const screenshots: string[] = [];

    try {
      switch (scenario) {
        case TestScenario.EPISODE_GENERATION:
          await this.automateEpisodeGeneration(
            user,
            page,
            steps,
            errors,
            screenshots
          );
          break;
        case TestScenario.AUDIO_PLAYBACK:
          await this.automateAudioPlayback(
            user,
            page,
            steps,
            errors,
            screenshots
          );
          break;
        case TestScenario.NAVIGATION_FLOW:
          await this.automateNavigationFlow(
            user,
            page,
            steps,
            errors,
            screenshots
          );
          break;
        case TestScenario.RESPONSIVE_DESIGN:
          await this.automateResponsiveDesign(
            user,
            page,
            steps,
            errors,
            screenshots
          );
          break;
        case TestScenario.PERFORMANCE_STRESS:
          await this.automatePerformanceStress(
            user,
            page,
            steps,
            errors,
            screenshots
          );
          break;
        case TestScenario.ERROR_RECOVERY:
          await this.automateErrorRecovery(
            user,
            page,
            steps,
            errors,
            screenshots
          );
          break;
      }
    } catch (error) {
      errors.push({
        type: "javascript",
        message: error instanceof Error ? error.message : "Automation error",
        stack: error instanceof Error ? error.stack : undefined,
        timestamp: new Date(),
      });

      if (this.config.screenshotOnFailure) {
        const screenshotPath = `./test-results/screenshots/${user.id}_${scenario}_error.png`;
        await page.screenshot({ path: screenshotPath, fullPage: true });
        screenshots.push(screenshotPath);
      }
    }

    const endTime = new Date();
    const success = errors.length === 0;

    return {
      userId: user.id,
      scenario,
      startTime,
      endTime,
      duration: endTime.getTime() - startTime.getTime(),
      success,
      steps,
      metrics: await this.gatherPageMetrics(page),
      errors,
      screenshots,
    };
  }

  /**
   * Automate episode generation workflow
   */
  private async automateEpisodeGeneration(
    user: SyntheticUserConfig,
    page: Page,
    steps: TestStepResult[],
    errors: TestError[],
    screenshots: string[]
  ): Promise<void> {
    // Navigate to homepage
    steps.push(
      await this.executeStep(page, "navigate_home", async () => {
        await page.goto(this.config.baseUrl);
        await page.waitForLoadState("networkidle");
      })
    );

    await this.simulateThinkTime(user);

    // Look for generate episode button
    steps.push(
      await this.executeStep(page, "find_generate_button", async () => {
        const button = page
          .locator(
            'button:has-text("Generate"), button:has-text("New Episode")'
          )
          .first();
        await button.waitFor({ timeout: 5000 });
        await button.click();
      })
    );

    await this.simulateThinkTime(user);

    // Fill in source URL
    steps.push(
      await this.executeStep(page, "enter_source_url", async () => {
        const urlInput = page
          .locator(
            'input[placeholder*="URL"], input[name*="url"], input[id*="url"]'
          )
          .first();
        await urlInput.waitFor({ timeout: 5000 });
        await urlInput.fill("https://example.com/test-article");
      })
    );

    await this.simulateThinkTime(user);

    // Select voice preference if available
    steps.push(
      await this.executeStep(page, "select_voice", async () => {
        const voiceSelect = page
          .locator('select[name*="voice"], select[id*="voice"]')
          .first();
        if (await voiceSelect.isVisible()) {
          await voiceSelect.selectOption({ index: 1 });
        }
      })
    );

    await this.simulateThinkTime(user);

    // Start generation
    steps.push(
      await this.executeStep(page, "start_generation", async () => {
        const generateButton = page
          .locator('button:has-text("Generate Episode"), button[type="submit"]')
          .first();
        await generateButton.click();
      })
    );

    // Wait for generation progress
    steps.push(
      await this.executeStep(page, "wait_for_progress", async () => {
        // Look for progress indicators
        const progressIndicators = [
          ".progress",
          '[role="progressbar"]',
          "text=generating",
          "text=processing",
        ];

        for (const indicator of progressIndicators) {
          try {
            await page.waitForSelector(indicator, { timeout: 10000 });
            break;
          } catch {
            // Try next indicator
          }
        }
      })
    );

    // Wait for completion (with reasonable timeout)
    steps.push(
      await this.executeStep(page, "wait_for_completion", async () => {
        const successIndicators = [
          "text=completed",
          "text=success",
          'button:has-text("Play")',
          ".episode-card",
        ];

        for (const indicator of successIndicators) {
          try {
            await page.waitForSelector(indicator, { timeout: 60000 });
            return;
          } catch {
            // Try next indicator
          }
        }

        throw new Error("Generation did not complete within timeout");
      })
    );

    // Take screenshot of result
    if (screenshots) {
      const screenshotPath = `./test-results/screenshots/${user.id}_episode_generation_result.png`;
      await page.screenshot({ path: screenshotPath, fullPage: true });
      screenshots.push(screenshotPath);
    }
  }

  /**
   * Automate audio playback testing
   */
  private async automateAudioPlayback(
    user: SyntheticUserConfig,
    page: Page,
    steps: TestStepResult[],
    errors: TestError[],
    screenshots: string[]
  ): Promise<void> {
    // Navigate to episodes page
    steps.push(
      await this.executeStep(page, "navigate_episodes", async () => {
        await page.goto(`${this.config.baseUrl}/episodes`);
        await page.waitForLoadState("networkidle");
      })
    );

    await this.simulateThinkTime(user);

    // Find and click on an episode
    steps.push(
      await this.executeStep(page, "select_episode", async () => {
        const episodeCards = page.locator(
          '.episode-card, [data-testid*="episode"]'
        );
        const count = await episodeCards.count();

        if (count === 0) {
          throw new Error("No episodes found");
        }

        await episodeCards.first().click();
      })
    );

    await this.simulateThinkTime(user);

    // Test play button
    steps.push(
      await this.executeStep(page, "test_play_button", async () => {
        const playButton = page
          .locator('button:has-text("Play"), button[aria-label*="play"]')
          .first();
        await playButton.waitFor({ timeout: 5000 });
        await playButton.click();
      })
    );

    // Wait a bit for audio to start
    await this.sleep(3000);

    // Test pause
    steps.push(
      await this.executeStep(page, "test_pause_button", async () => {
        const pauseButton = page
          .locator('button:has-text("Pause"), button[aria-label*="pause"]')
          .first();
        await pauseButton.waitFor({ timeout: 5000 });
        await pauseButton.click();
      })
    );

    await this.simulateThinkTime(user);

    // Test volume control if available
    steps.push(
      await this.executeStep(page, "test_volume_control", async () => {
        const volumeSlider = page.locator(
          'input[type="range"][aria-label*="volume"], .volume-slider'
        );
        if (await volumeSlider.isVisible()) {
          await volumeSlider.fill("0.5");
        }
      })
    );
  }

  /**
   * Automate navigation flow testing
   */
  private async automateNavigationFlow(
    user: SyntheticUserConfig,
    page: Page,
    steps: TestStepResult[],
    errors: TestError[],
    screenshots: string[]
  ): Promise<void> {
    const pages = [
      { path: "/", name: "Home" },
      { path: "/episodes", name: "Episodes" },
      { path: "/sources", name: "Sources" },
      { path: "/queue", name: "Queue" },
      { path: "/internal", name: "Internal" },
    ];

    for (const pageInfo of pages) {
      steps.push(
        await this.executeStep(
          page,
          `navigate_${pageInfo.name.toLowerCase()}`,
          async () => {
            await page.goto(`${this.config.baseUrl}${pageInfo.path}`);
            await page.waitForLoadState("networkidle");

            // Verify page loaded correctly
            await page.waitForSelector('main, [role="main"], .content', {
              timeout: 10000,
            });
          }
        )
      );

      await this.simulateThinkTime(user);
    }
  }

  /**
   * Automate responsive design testing
   */
  private async automateResponsiveDesign(
    user: SyntheticUserConfig,
    page: Page,
    steps: TestStepResult[],
    errors: TestError[],
    screenshots: string[]
  ): Promise<void> {
    const viewports = [
      { width: 390, height: 844, name: "mobile" },
      { width: 768, height: 1024, name: "tablet" },
      { width: 1440, height: 900, name: "desktop" },
    ];

    for (const viewport of viewports) {
      steps.push(
        await this.executeStep(
          page,
          `test_${viewport.name}_viewport`,
          async () => {
            await page.setViewportSize(viewport);
            await page.goto(this.config.baseUrl);
            await page.waitForLoadState("networkidle");

            // Take screenshot for visual validation
            const screenshotPath = `./test-results/screenshots/${user.id}_${viewport.name}_viewport.png`;
            await page.screenshot({ path: screenshotPath, fullPage: true });
            screenshots.push(screenshotPath);
          }
        )
      );

      await this.simulateThinkTime(user);
    }
  }

  /**
   * Automate performance stress testing
   */
  private async automatePerformanceStress(
    user: SyntheticUserConfig,
    page: Page,
    steps: TestStepResult[],
    errors: TestError[],
    screenshots: string[]
  ): Promise<void> {
    // Rapid navigation test
    const pages = ["/", "/episodes", "/sources", "/queue"];

    for (let i = 0; i < 5; i++) {
      for (const pagePath of pages) {
        steps.push(
          await this.executeStep(
            page,
            `rapid_nav_${i}_${pagePath}`,
            async () => {
              await page.goto(`${this.config.baseUrl}${pagePath}`);
              await page.waitForLoadState("domcontentloaded"); // Faster than networkidle
            }
          )
        );

        await this.sleep(200); // Very brief pause
      }
    }

    // Memory usage check
    steps.push(
      await this.executeStep(page, "memory_check", async () => {
        const memoryUsage = await page.evaluate(() => {
          return (performance as any).memory?.usedJSHeapSize || 0;
        });

        console.log(
          `Memory usage for ${user.id}: ${Math.round(memoryUsage / 1024 / 1024)}MB`
        );
      })
    );
  }

  /**
   * Automate error recovery testing
   */
  private async automateErrorRecovery(
    user: SyntheticUserConfig,
    page: Page,
    steps: TestStepResult[],
    errors: TestError[],
    screenshots: string[]
  ): Promise<void> {
    // Test 404 page handling
    steps.push(
      await this.executeStep(page, "test_404_page", async () => {
        await page.goto(`${this.config.baseUrl}/nonexistent-page`);
        await page.waitForLoadState("networkidle");

        // Should show 404 page or redirect
        const pageContent = await page.textContent("body");
        if (!pageContent?.includes("404") && !page.url().includes("404")) {
          throw new Error("404 page not properly handled");
        }
      })
    );

    // Test invalid form input
    steps.push(
      await this.executeStep(page, "test_invalid_input", async () => {
        await page.goto(this.config.baseUrl);

        // Find a form input and enter invalid data
        const urlInput = page
          .locator('input[type="url"], input[placeholder*="URL"]')
          .first();
        if (await urlInput.isVisible()) {
          await urlInput.fill("invalid-url");

          // Try to submit and see if validation works
          const submitButton = page
            .locator('button[type="submit"], button:has-text("Generate")')
            .first();
          if (await submitButton.isVisible()) {
            await submitButton.click();

            // Check for validation message
            await page.waitForSelector('.error, .alert-error, [role="alert"]', {
              timeout: 5000,
            });
          }
        }
      })
    );
  }

  /**
   * Execute a single test step with error handling
   */
  private async executeStep(
    page: Page,
    action: string,
    stepFunction: () => Promise<void>
  ): Promise<TestStepResult> {
    const startTime = new Date();

    try {
      await stepFunction();

      return {
        step: action,
        action,
        timestamp: startTime,
        success: true,
        duration: new Date().getTime() - startTime.getTime(),
      };
    } catch (error) {
      return {
        step: action,
        action,
        timestamp: startTime,
        success: false,
        duration: new Date().getTime() - startTime.getTime(),
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Simulate realistic user think time
   */
  private async simulateThinkTime(user: SyntheticUserConfig): Promise<void> {
    const thinkTime = this.randomBetween(
      user.behaviorPattern.thinkTime.min,
      user.behaviorPattern.thinkTime.max
    );
    await this.sleep(thinkTime);
  }

  /**
   * Gather real page performance metrics
   */
  private async gatherPageMetrics(page: Page): Promise<PerformanceMetrics> {
    return await page.evaluate(() => {
      const navigation = performance.getEntriesByType(
        "navigation"
      )[0] as PerformanceNavigationTiming;
      const paintEntries = performance.getEntriesByType("paint");

      const fcp =
        paintEntries.find((entry) => entry.name === "first-contentful-paint")
          ?.startTime || 0;

      return {
        pageLoadTime: navigation.loadEventEnd - navigation.loadEventStart,
        firstContentfulPaint: fcp,
        largestContentfulPaint: 0, // Would need LCP observer
        interactionToNextPaint: 0, // Would need INP observer
        cumulativeLayoutShift: 0, // Would need CLS observer
        networkRequests: performance.getEntriesByType("resource").length,
        totalDataTransferred: performance
          .getEntriesByType("resource")
          .reduce((total, entry: any) => total + (entry.transferSize || 0), 0),
      };
    });
  }

  /**
   * Utility functions
   */
  private randomBetween(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Cleanup all browser resources
   */
  async cleanup(): Promise<void> {
    // Close all pages
    for (const page of this.pages.values()) {
      await page.close();
    }
    this.pages.clear();

    // Close all contexts
    for (const context of this.contexts.values()) {
      await context.close();
    }
    this.contexts.clear();

    // Close all browsers
    for (const browser of this.browsers.values()) {
      await browser.close();
    }
    this.browsers.clear();
  }
}

/**
 * Factory function for canary automation
 */
export function createCanaryAutomation(
  config: Partial<AutomationConfig> = {}
): CanaryAutomation {
  const defaultConfig: AutomationConfig = {
    headless: true,
    baseUrl: "http://localhost:3000",
    timeout: 30000,
    screenshotOnFailure: true,
    recordVideo: false,
    slowMo: 100,
    retryAttempts: 2,
  };

  return new CanaryAutomation({ ...defaultConfig, ...config });
}

/**
 * Quick canary validation function
 *
 * @business-context Provides a simple way to run canary tests for critical features
 */
export async function runCanaryValidation(
  config: Partial<AutomationConfig> = {}
): Promise<Map<string, TestExecutionResult[]>> {
  const automation = createCanaryAutomation(config);

  try {
    return await automation.executeAutomatedTests(["chromium"]);
  } finally {
    await automation.cleanup();
  }
}
