import { writeFile, mkdir } from "fs/promises";
import { join } from "path";

import type {
  FullConfig,
  FullResult,
  Reporter,
  Suite,
  TestCase,
  TestResult,
} from "@playwright/test/reporter";

class CoverageReporter implements Reporter {
  private coverageData: any[] = [];
  private config: FullConfig | undefined;

  onBegin(config: FullConfig, suite: Suite) {
    this.config = config;
    console.log(
      `🔍 Coverage Reporter: Starting coverage collection for ${suite.allTests().length} tests`
    );
  }

  onTestEnd(test: TestCase, result: TestResult) {
    // Extract coverage data from test result if available
    if (result.attachments) {
      const coverageAttachment = result.attachments.find(
        (a) => a.name === "coverage"
      );
      if (coverageAttachment) {
        this.coverageData.push({
          testTitle: test.title,
          projectName: test.parent.project()?.name,
          coverage: coverageAttachment,
        });
      }
    }
  }

  async onEnd(result: FullResult) {
    const coverageDir = join(process.cwd(), "coverage");
    await mkdir(coverageDir, { recursive: true });

    // Generate coverage report
    const report = {
      timestamp: new Date().toISOString(),
      status: result.status,
      totalTests: this.coverageData.length,
      projects: [...new Set(this.coverageData.map((d) => d.projectName))],
      summary: {
        message: "E2E test coverage collection completed",
        instructions: [
          "Coverage data is collected during test execution",
          "Use page.coverage.startJSCoverage() and page.coverage.startCSSCoverage() in tests",
          "Coverage data includes JS and CSS usage metrics",
          "Combine with unit test coverage for full picture",
        ],
      },
      coverage:
        this.coverageData.length > 0
          ? this.coverageData
          : "No coverage data collected",
    };

    try {
      await writeFile(
        join(coverageDir, "e2e-coverage-report.json"),
        JSON.stringify(report, null, 2)
      );

      console.log(
        `📊 Coverage Report: Generated report with ${this.coverageData.length} test coverage entries`
      );
      console.log(
        `📁 Coverage data saved to: coverage/e2e-coverage-report.json`
      );

      if (this.coverageData.length === 0) {
        console.log(`💡 Tip: Add coverage collection to your tests:
        
await page.coverage.startJSCoverage()
await page.coverage.startCSSCoverage()
// ... run your test
const jsCoverage = await page.coverage.stopJSCoverage()
const cssCoverage = await page.coverage.stopCSSCoverage()`);
      }
    } catch (error) {
      console.error("❌ Failed to write coverage report:", error);
    }
  }
}

export default CoverageReporter;
