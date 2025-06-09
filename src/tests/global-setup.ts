import { chromium, type FullConfig } from "@playwright/test";
import { mkdir } from "fs/promises";
import { join } from "path";

async function globalSetup(config: FullConfig) {
  console.log("🚀 Starting Morning Pod E2E Test Suite");

  // Create necessary directories
  await mkdir(join(process.cwd(), "test-results"), { recursive: true });
  await mkdir(join(process.cwd(), "playwright-report"), { recursive: true });
  await mkdir(join(process.cwd(), "coverage"), { recursive: true });

  // Launch browser for coverage collection setup
  const browser = await chromium.launch();
  const context = await browser.newContext();

  // Enable coverage collection
  const page = await context.newPage();

  // Start JS and CSS coverage
  await page.coverage.startJSCoverage({
    resetOnNavigation: false,
  });

  await page.coverage.startCSSCoverage({
    resetOnNavigation: false,
  });

  // Navigate to ensure app is ready
  try {
    await page.goto(config.projects[0].use?.baseURL || "http://localhost:3000");
    await page.waitForLoadState("networkidle");
    console.log("✅ App is ready for testing");
  } catch (error) {
    console.warn("⚠️  Could not verify app readiness:", error);
  }

  await browser.close();

  console.log("🎭 Global setup complete");
}

export default globalSetup;
