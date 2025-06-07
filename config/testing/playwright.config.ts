import { defineConfig, devices } from "@playwright/test";

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: "../../src/tests/e2e",

  /* Output directories */
  outputDir: "./test-results",

  /* Run tests in files in parallel - reduced for Mac M1X performance */
  fullyParallel: true,

  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,

  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,

  /* Limit workers to prevent Mac M1X from getting overwhelmed */
  workers: process.env.CI ? 1 : 2,

  /* Enhanced reporting with multiple formats */
  reporter: [
    ["html", { outputFolder: "playwright-report", open: "never" }],
    ["list"],
    ["junit", { outputFile: "test-results/junit-results.xml" }],
    ["json", { outputFile: "test-results/test-results.json" }],
  ],

  /* Global setup and teardown */
  globalSetup: require.resolve("../../src/tests/global-setup.ts"),
  globalTeardown: require.resolve("../../src/tests/global-teardown.ts"),

  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: "http://localhost:3000",

    /* Enhanced tracing and debugging */
    trace: process.env.CI ? "retain-on-failure" : "on-first-retry",

    /* Enhanced screenshot options */
    screenshot: "only-on-failure",

    /* Record video for failed tests */
    video: "retain-on-failure",

    /* Set user agent for better tracking */
    userAgent: "Morning-Pod-E2E-Tests",

    /* Ignore HTTPS errors for testing */
    ignoreHTTPSErrors: true,

    /* Set default navigation timeout */
    navigationTimeout: 30000,

    /* Set default action timeout */
    actionTimeout: 10000,
  },

  /* Test timeout */
  timeout: 30000,

  /* Expect timeout for assertions */
  expect: {
    timeout: 5000,
    toHaveScreenshot: { threshold: 0.3 },
  },

  /* Configure projects for major browsers and themes */
  projects: [
    // Desktop - Forest Theme (Default)
    {
      name: "chromium-forest",
      use: {
        ...devices["Desktop Chrome"],
      },
    },
    {
      name: "firefox-forest",
      use: {
        ...devices["Desktop Firefox"],
      },
    },
    {
      name: "webkit-forest",
      use: {
        ...devices["Desktop Safari"],
      },
    },

    // Desktop - Dark Theme
    {
      name: "chromium-dark",
      use: {
        ...devices["Desktop Chrome"],
      },
    },

    // Desktop - Light Theme
    {
      name: "chromium-light",
      use: {
        ...devices["Desktop Chrome"],
      },
    },

    // Desktop - Cyberpunk Theme (Different Light)
    {
      name: "chromium-cyberpunk",
      use: {
        ...devices["Desktop Chrome"],
      },
    },

    // Mobile Testing
    {
      name: "Mobile Chrome",
      use: {
        ...devices["Pixel 5"],
      },
    },
    {
      name: "Mobile Safari",
      use: {
        ...devices["iPhone 12"],
      },
    },

    // Tablet Testing
    {
      name: "iPad",
      use: {
        ...devices["iPad Pro"],
      },
    },

    // Large Desktop Testing
    {
      name: "Large Desktop",
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 1920, height: 1080 },
      },
    },
  ],

  /* Run your local dev server before starting the tests */
  webServer: {
    command: "bun run dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
});
