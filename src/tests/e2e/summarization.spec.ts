import { test, expect } from "@playwright/test";
import { setupAuth, mockTrpcResponses } from "../e2e-utils";

// Mock data for testing
const mockSummaryResult = {
  success: true,
  data: {
    summary:
      "OpenAI has released GPT-4 Turbo, a more powerful and cost-effective version of their language model. The new model features a 128,000 token context window, updated knowledge through April 2024, and significantly reduced pricing. This advancement represents a major step forward in making AI capabilities more accessible for developers and businesses across various sectors.",
    keyPoints: [
      "128,000 token context window - 4x larger than GPT-4",
      "Updated knowledge cutoff to April 2024",
      "Reduced pricing: $0.01 per 1K input tokens, $0.03 per 1K output tokens",
      "Improved reasoning capabilities and reduced hallucinations",
      "Enhanced performance on coding tasks",
    ],
    takeaways: [
      "AI adoption will accelerate across customer service, content creation, and software development",
      "More cost-effective AI solutions will become available to smaller businesses",
      "Enhanced code generation capabilities will improve developer productivity",
    ],
    metadata: {
      originalLength: 1240,
      summaryLength: 312,
      compressionRatio: 0.25,
      processingTime: 2850,
      cost: 0.0248,
      model: "gpt-4-turbo-preview",
      quality: {
        coherence: 0.92,
        relevance: 0.88,
        readability: 0.85,
      },
    },
    ttsOptimized: {
      text: 'OpenAI has released GPT-4 Turbo, <break time="0.5s"/> a more powerful and cost-effective version of their language model. <break time="0.5s"/> The new model features a 128,000 token context window, <break time="0.3s"/> updated knowledge through April 2024, <break time="0.3s"/> and significantly reduced pricing.',
      estimatedDuration: 45,
      pauseMarkers: ["pause_0", "pause_1", "pause_2"],
    },
  },
};

const mockMetrics = {
  success: true,
  metrics: {
    totalRequests: 127,
    successfulRequests: 122,
    failedRequests: 5,
    totalCost: 3.2845,
    averageProcessingTime: 2650,
    averageQualityScore: 0.86,
    costByModel: {
      "gpt-4-turbo-preview": 2.845,
      "gpt-4": 0.4395,
    },
    qualityDistribution: {
      excellent: 89,
      good: 28,
      fair: 5,
      poor: 0,
    },
    last24Hours: {
      requests: 23,
      cost: 0.5842,
      averageQuality: 0.89,
    },
  },
};

const mockHistory = {
  success: true,
  history: [
    {
      id: "sum_1704387600000_abc123",
      timestamp: "2024-01-04T15:30:00.000Z",
      request: {
        content: "Test content about AI developments...",
        source: "Tech News",
        title: "AI Breakthrough Announcement",
        contentType: "tech",
        summaryStyle: "conversational",
        targetLength: "medium",
      },
      success: true,
    },
    {
      id: "sum_1704384000000_def456",
      timestamp: "2024-01-04T14:30:00.000Z",
      request: {
        content: "Business news about market trends...",
        source: "Business Wire",
        title: "Market Analysis Q4",
        contentType: "business",
        summaryStyle: "brief",
        targetLength: "short",
      },
      success: true,
    },
  ],
  total: 127,
};

const mockConfig = {
  success: true,
  config: {
    provider: "openai",
    model: "gpt-4-turbo-preview",
    maxTokens: 2000,
    temperature: 0.3,
    qualityThresholds: {
      minCoherence: 0.7,
      minRelevance: 0.7,
      minReadability: 0.6,
    },
  },
};

test.describe("AI Summarization Lab", () => {
  test.beforeEach(async ({ page }) => {
    await setupAuth(page);

    // Mock tRPC responses
    await page.route("**/api/trpc/**", async (route) => {
      const url = route.request().url();
      const postData = route.request().postData();

      try {
        console.log("Intercepting tRPC request:", url);
        if (postData) {
          console.log("Request data:", postData);
        }

        // Handle batch requests
        if (postData && postData.includes("batch")) {
          const batchData = JSON.parse(postData);
          const responses = batchData.map((request: any) => {
            const { path } = request;
            if (path === "summarization.getMetrics") return mockMetrics;
            if (path === "summarization.getConfig") return mockConfig;
            if (path === "summarization.getHistory") return mockHistory;
            return { success: false, error: "Not found" };
          });

          await route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify(responses),
          });
          return;
        }

        // Handle individual requests
        if (url.includes("summarization.summarizeContent")) {
          await route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify({ result: { data: mockSummaryResult } }),
          });
        } else if (url.includes("summarization.getMetrics")) {
          await route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify({ result: { data: mockMetrics } }),
          });
        } else if (url.includes("summarization.getConfig")) {
          await route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify({ result: { data: mockConfig } }),
          });
        } else if (url.includes("summarization.getHistory")) {
          await route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify({ result: { data: mockHistory } }),
          });
        } else if (url.includes("summarization.testConfiguration")) {
          await route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify({ result: { data: { success: true } } }),
          });
        } else if (url.includes("summarization.updateConfig")) {
          await route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify({
              result: {
                data: {
                  success: true,
                  message: "Configuration updated successfully",
                },
              },
            }),
          });
        } else {
          await route.continue();
        }
      } catch (error) {
        console.error("Route handler error:", error);
        await route.continue();
      }
    });
  });

  test("should load summarization lab page", async ({ page }) => {
    await page.goto("/internal/summarization");

    // Check for main heading
    await expect(page.locator("h1")).toContainText("AI Summarization Lab");

    // Check for main sections
    await expect(
      page.locator("h2").filter({ hasText: "Content Input" })
    ).toBeVisible();
    await expect(
      page.locator("h2").filter({ hasText: "Metrics" })
    ).toBeVisible();
    await expect(
      page.locator("h2").filter({ hasText: "Configuration" })
    ).toBeVisible();
  });

  test("should have accessible form controls", async ({ page }) => {
    await page.goto("/internal/summarization");

    // Check form inputs have proper labels
    await expect(
      page.locator("label").filter({ hasText: "Source" })
    ).toBeVisible();
    await expect(
      page.locator("label").filter({ hasText: "Title" })
    ).toBeVisible();
    await expect(
      page.locator("label").filter({ hasText: "Content" })
    ).toBeVisible();

    // Check select dropdowns
    await expect(page.locator("select").first()).toBeVisible();

    // Check textarea
    await expect(page.locator("textarea")).toBeVisible();

    // Check main action button
    await expect(
      page.locator("button").filter({ hasText: "Generate Summary" })
    ).toBeVisible();
  });

  test("should display metrics dashboard", async ({ page }) => {
    await page.goto("/internal/summarization");

    // Wait for metrics to load
    await page.waitForTimeout(1000);

    // Check metrics cards
    await expect(page.locator("text=Total Requests")).toBeVisible();
    await expect(page.locator("text=Success Rate")).toBeVisible();
    await expect(page.locator("text=Total Cost")).toBeVisible();
    await expect(page.locator("text=Avg Processing")).toBeVisible();
    await expect(page.locator("text=Avg Quality")).toBeVisible();

    // Check quality distribution
    await expect(page.locator("text=Quality Distribution")).toBeVisible();
    await expect(page.locator("text=Excellent")).toBeVisible();
    await expect(page.locator("text=Good")).toBeVisible();
  });

  test("should handle content input and options", async ({ page }) => {
    await page.goto("/internal/summarization");

    // Test content input
    const textarea = page.locator("textarea");
    await textarea.fill("Test content for summarization");
    await expect(textarea).toHaveValue("Test content for summarization");

    // Test source input
    const sourceInput = page.locator('input[placeholder="Content source"]');
    await sourceInput.fill("Test Source");
    await expect(sourceInput).toHaveValue("Test Source");

    // Test title input
    const titleInput = page.locator('input[placeholder="Content title"]');
    await titleInput.fill("Test Title");
    await expect(titleInput).toHaveValue("Test Title");

    // Test dropdowns
    await page.locator("select").first().selectOption("business");
    await page.locator("select").nth(1).selectOption("brief");
    await page.locator("select").nth(2).selectOption("short");

    // Test checkboxes
    const keyPointsCheckbox = page.locator('input[type="checkbox"]').first();
    await keyPointsCheckbox.check();
    await expect(keyPointsCheckbox).toBeChecked();
  });

  test("should generate summary with valid input", async ({ page }) => {
    await page.goto("/internal/summarization");

    // Fill in content
    await page
      .locator("textarea")
      .fill("OpenAI has announced GPT-4 Turbo with improved capabilities...");
    await page
      .locator('input[placeholder="Content source"]')
      .fill("OpenAI Blog");
    await page
      .locator('input[placeholder="Content title"]')
      .fill("GPT-4 Turbo Announcement");

    // Click generate button
    const generateButton = page
      .locator("button")
      .filter({ hasText: "Generate Summary" });
    await generateButton.click();

    // Wait for summary result
    await page.waitForTimeout(2000);

    // Check for summary result section
    await expect(
      page.locator("h2").filter({ hasText: "Summary Result" })
    ).toBeVisible();
    await expect(
      page.locator("h3").filter({ hasText: "Summary" })
    ).toBeVisible();

    // Check for metadata
    await expect(page.locator("text=Compression")).toBeVisible();
    await expect(page.locator("text=Processing")).toBeVisible();
    await expect(page.locator("text=Cost")).toBeVisible();
    await expect(page.locator("text=Quality")).toBeVisible();
  });

  test("should display configuration options", async ({ page }) => {
    await page.goto("/internal/summarization");

    // Check configuration section
    await expect(
      page.locator("h2").filter({ hasText: "Configuration" })
    ).toBeVisible();

    // Check configuration controls
    await expect(
      page.locator("label").filter({ hasText: "Provider" })
    ).toBeVisible();
    await expect(
      page.locator("label").filter({ hasText: "Model" })
    ).toBeVisible();
    await expect(
      page.locator("label").filter({ hasText: "Max Tokens" })
    ).toBeVisible();
    await expect(
      page.locator("label").filter({ hasText: "Temperature" })
    ).toBeVisible();

    // Check action buttons
    await expect(
      page.locator("button").filter({ hasText: "Test" })
    ).toBeVisible();
    await expect(
      page.locator("button").filter({ hasText: "Update" })
    ).toBeVisible();
  });

  test("should handle configuration testing", async ({ page }) => {
    await page.goto("/internal/summarization");

    // Click test configuration button
    const testButton = page.locator("button").filter({ hasText: "Test" });
    await testButton.click();

    // Wait for test result
    await page.waitForTimeout(1000);

    // Should show success message
    await expect(page.locator("text=Configuration test passed!")).toBeVisible();
  });

  test("should update configuration", async ({ page }) => {
    await page.goto("/internal/summarization");

    // Change configuration values
    await page
      .locator("select")
      .filter({ hasText: "OpenAI" })
      .selectOption("openai");
    await page.locator('input[type="number"]').first().fill("1500");
    await page.locator('input[type="number"]').nth(1).fill("0.5");

    // Click update button
    const updateButton = page.locator("button").filter({ hasText: "Update" });
    await updateButton.click();

    // Wait for update confirmation
    await page.waitForTimeout(1000);
  });

  test("should display recent history", async ({ page }) => {
    await page.goto("/internal/summarization");

    // Wait for history to load
    await page.waitForTimeout(1000);

    // Check for history section
    await expect(
      page.locator("h2").filter({ hasText: "Recent History" })
    ).toBeVisible();

    // Check for history items
    await expect(
      page.locator("text=AI Breakthrough Announcement")
    ).toBeVisible();
    await expect(page.locator("text=Market Analysis Q4")).toBeVisible();

    // Check for success badges
    await expect(
      page.locator(".badge-success").filter({ hasText: "Success" })
    ).toHaveCount(2);
  });

  test("should be responsive on mobile", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/internal/summarization");

    // Check main layout
    await expect(page.locator("h1")).toBeVisible();

    // Check form controls are accessible
    await expect(page.locator("textarea")).toBeVisible();
    await expect(
      page.locator("button").filter({ hasText: "Generate Summary" })
    ).toBeVisible();

    // Check cards stack vertically
    await expect(page.locator(".card")).toHaveCount(3); // Input, Metrics, Configuration
  });

  test("should handle errors gracefully", async ({ page }) => {
    await page.goto("/internal/summarization");

    // Mock error response
    await page.route("**/api/trpc/**", async (route) => {
      if (route.request().url().includes("summarization.summarizeContent")) {
        await route.fulfill({
          status: 500,
          contentType: "application/json",
          body: JSON.stringify({
            error: {
              message: "API rate limit exceeded",
              code: "RATE_LIMIT",
            },
          }),
        });
      } else {
        await route.continue();
      }
    });

    // Try to generate summary
    await page.locator("textarea").fill("Test content");
    await page
      .locator("button")
      .filter({ hasText: "Generate Summary" })
      .click();

    // Wait for error
    await page.waitForTimeout(2000);

    // Should show error message
    await expect(page.locator(".alert-error")).toBeVisible();
  });

  test("should validate required fields", async ({ page }) => {
    await page.goto("/internal/summarization");

    // Generate button should be disabled without content
    const generateButton = page
      .locator("button")
      .filter({ hasText: "Generate Summary" });
    await expect(generateButton).toBeDisabled();

    // Add content
    await page.locator("textarea").fill("Some test content");

    // Button should be enabled now
    await expect(generateButton).toBeEnabled();
  });

  test("should show character count", async ({ page }) => {
    await page.goto("/internal/summarization");

    const testText = "This is a test content for character counting.";
    await page.locator("textarea").fill(testText);

    // Should show character count
    await expect(
      page.locator(`text=${testText.length} characters`)
    ).toBeVisible();
  });
});
