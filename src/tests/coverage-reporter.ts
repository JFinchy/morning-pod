import {
  type FullConfig,
  type FullResult,
  type Reporter,
  type Suite,
  type TestCase,
  type TestResult,
} from "@playwright/test/reporter";
import { mkdir, writeFile } from "fs/promises";
import { join } from "path";

class CoverageReporter implements Reporter {
  private coverageData: Array<{
    coverage: TestResult["attachments"][0];
    projectName: string | undefined;
    testTitle: string;
  }> = [];

  onBegin(_config: FullConfig, suite: Suite) {
    console.log(
      `🔍 Coverage Reporter: Starting coverage collection for ${suite.allTests().length} tests`
    );
  }

  async onEnd(result: FullResult) {
    const coverageDir = join(process.cwd(), "coverage");
    await mkdir(coverageDir, { recursive: true });

    // Generate coverage report
    const report = {
      coverage:
        this.coverageData.length > 0
          ? this.coverageData
          : "No coverage data collected",
      projects: [...new Set(this.coverageData.map((d) => d.projectName))],
      status: result.status,
      summary: {
        instructions: [
          "Coverage data is collected during test execution",
          "Use page.coverage.startJSCoverage() and page.coverage.startCSSCoverage() in tests",
          "Coverage data includes JS and CSS usage metrics",
          "Combine with unit test coverage for full picture",
        ],
        message: "E2E test coverage collection completed",
      },
      timestamp: new Date().toISOString(),
      totalTests: this.coverageData.length,
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

  onTestEnd(test: TestCase, result: TestResult) {
    // Extract coverage data from test result if available
    if (result.attachments) {
      const coverageAttachment = result.attachments.find(
        (a) => a.name === "coverage"
      );
      if (coverageAttachment) {
        this.coverageData.push({
          coverage: coverageAttachment,
          projectName: test.parent.project()?.name,
          testTitle: test.title,
        });
      }
    }
  }
}

export default CoverageReporter;
