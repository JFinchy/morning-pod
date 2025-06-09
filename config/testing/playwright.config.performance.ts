import { defineConfig, devices } from "@playwright/test";

/**
 * Performance-optimized Playwright configuration for resource-constrained environments
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  /* Shorter expect timeout for assertions */
  expect: {
    timeout: 3000,
    toHaveScreenshot: { threshold: 0.3 },
  },

  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,

  /* Disable parallel execution to reduce resource usage */
  fullyParallel: false,

  /* Global setup and teardown */
  globalSetup: require.resolve("../../src/tests/global-setup.ts"),

  globalTeardown: require.resolve("../../src/tests/global-teardown.ts"),

  /* Output directories */
  outputDir: "./test-results",

  /* Minimal browser projects for performance testing */
  projects: [
    // Only test with Chromium for performance runs
    {
      name: "chromium-performance",
      use: {
        ...devices["Desktop Chrome"],
      },
    },
  ],

  /* Minimal reporting to reduce overhead */
  reporter: [
    ["list"],
    ["html", { open: "never", outputFolder: "playwright-report" }],
  ],
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,

  testDir: "../../src/tests/e2e",

  /* Shorter test timeout */
  timeout: 15000,

  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    actionTimeout: 5000,

    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: "http://localhost:3000",

    /* Ignore HTTPS errors for testing */
    ignoreHTTPSErrors: true,

    /* Shorter timeouts for faster feedback */
    navigationTimeout: 15000,

    /* No screenshots by default to save resources */
    screenshot: "off",

    /* Minimal tracing to reduce overhead */
    trace: "off",

    /* Set user agent for better tracking */
    userAgent: "Morning-Pod-E2E-Tests-Performance",
    /* No video recording to save resources */
    video: "off",
  },

  /* Run your local dev server before starting the tests */
  webServer: {
    command: "bun run dev",
    reuseExistingServer: !process.env.CI,
    timeout: 60 * 1000, // Shorter timeout
    url: "http://localhost:3000",
  },

  /* Single worker to minimize resource usage */
  workers: 1,
});
