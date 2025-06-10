import { type FullConfig } from "@playwright/test";
import { writeFile } from "fs/promises";
import { join } from "path";

async function globalTeardown(config: FullConfig) {
  console.log("🧹 Starting Morning Pod E2E Test Cleanup");

  // Log test summary
  const testResultsPath = join(process.cwd(), "test-results");
  const reportPath = join(process.cwd(), "playwright-report");

  console.log(`📊 Test results saved to: ${testResultsPath}`);
  console.log(`📈 HTML report available at: ${reportPath}/index.html`);

  // Generate coverage summary
  try {
    const coverageSummary = {
      instructions: [
        "1. Coverage is collected automatically during E2E tests",
        "2. View detailed coverage in playwright-report",
        "3. JS/CSS coverage data is embedded in test results",
        "4. Use bun test:coverage for combined coverage report",
      ],
      message: "Coverage data collected during E2E tests",
      projects: config.projects.length,
      timestamp: new Date().toISOString(),
    };

    await writeFile(
      join(process.cwd(), "coverage", "e2e-summary.json"),
      JSON.stringify(coverageSummary, null, 2)
    );

    console.log("📋 Coverage summary generated");
  } catch (error) {
    console.warn("⚠️  Could not generate coverage summary:", error);
  }

  console.log("✨ Global teardown complete");
}

export default globalTeardown;
