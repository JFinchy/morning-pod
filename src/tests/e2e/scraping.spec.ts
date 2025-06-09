import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test.describe("Scraping Page E2E", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/scraping");
  });

  test("should load scraping page successfully", async ({ page }) => {
    // Wait for page to load
    await page.waitForLoadState("networkidle");

    // Check for main heading
    await expect(
      page.getByRole("heading", { level: 1, name: /content scraping/i })
    ).toBeVisible();

    // Check for metrics cards
    await expect(page.getByText(/available scrapers/i)).toBeVisible();
    await expect(page.getByText(/cached content/iu)).toBeVisible();
    await expect(page.getByText(/last activity/i)).toBeVisible();

    // Check for navigation
    await expect(page.getByRole("navigation")).toBeVisible();

    // Check for main content area
    await expect(page.getByRole("main")).toBeVisible();
  });

  test("should have no accessibility violations", async ({ page }) => {
    await page.waitForLoadState("networkidle");

    // Close any external dev tools or overlays
    await page.evaluate(() => {
      const devOverlay = document.querySelector('[id*="nextjs"]');
      if (devOverlay) devOverlay.remove();

      const externalOverlays = document.querySelectorAll(
        '[data-headlessui-state], .pointer-events-none, [class*="stagewise"]'
      );
      for (const el of externalOverlays) {
        if (
          el.getAttribute("data-headlessui-state") !== null ||
          el.classList.contains("pointer-events-none") ||
          el.className.includes("stagewise")
        ) {
          el.remove();
        }
      }
    });

    const accessibilityScanResults = await new AxeBuilder({ page })
      .exclude("[data-playwright-ignore]")
      .exclude("[data-headlessui-state]")
      .exclude(".pointer-events-none")
      .exclude('[class*="stagewise"]')
      .disableRules(["nested-interactive"])
      .analyze();

    const criticalViolations = accessibilityScanResults.violations.filter(
      (violation) => {
        if (["color-contrast", "region"].includes(violation.id)) return false;

        if (
          violation.nodes.some((node) =>
            node.target.some(
              (target) =>
                target.includes("headlessui") ||
                target.includes("stagewise") ||
                target.includes("nextjs") ||
                target.includes("pointer-events-none")
            )
          )
        )
          return false;

        return true;
      }
    );

    if (accessibilityScanResults.violations.length > 0) {
      console.log(
        "Accessibility violations found:",
        accessibilityScanResults.violations.length
      );
      for (const violation of accessibilityScanResults.violations) {
        console.log(`- ${violation.id}: ${violation.help}`);
      }
    }

    expect(criticalViolations).toEqual([]);
  });

  test("should display scraping controls", async ({ page }) => {
    await page.waitForLoadState("networkidle");

    // Check for main scrape all button
    await expect(
      page.getByRole("button", { name: /scrape all sources/i })
    ).toBeVisible();

    // Check for individual scraper buttons
    await expect(
      page.getByRole("button", { name: /scrape tldr/i })
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: /scrape hacker news/i })
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: /scrape morning brew/i })
    ).toBeVisible();
  });

  test("should handle scrape all action", async ({ page }) => {
    await page.waitForLoadState("networkidle");

    // Mock the tRPC call to prevent actual scraping
    await page.route("**/api/trpc/scraping.scrapeAll**", async (route) => {
      await route.fulfill({
        body: JSON.stringify({
          result: {
            data: {
              results: [
                { itemsFound: 5, source: "tldr", success: true },
                { itemsFound: 8, source: "hackernews", success: true },
                { itemsFound: 3, source: "morningbrew", success: true },
              ],
              success: true,
            },
          },
        }),
        contentType: "application/json",
        status: 200,
      });
    });

    // Click scrape all button
    const scrapeAllButton = page.getByRole("button", {
      name: /scrape all sources/i,
    });
    await scrapeAllButton.click();

    // Should show loading state
    await expect(page.getByText(/scraping.../i)).toBeVisible();

    // Wait for completion and check for success
    await page.waitForTimeout(1000);

    // Clean up routes
    await page.unrouteAll({ behavior: "ignoreErrors" });
  });

  test("should handle individual scraper action", async ({ page }) => {
    await page.waitForLoadState("networkidle");

    // Mock individual scraper call
    await page.route("**/api/trpc/scraping.scrapeSource**", async (route) => {
      await route.fulfill({
        body: JSON.stringify({
          result: {
            data: {
              content: [
                {
                  id: "test-1",
                  source: "tldr",
                  summary: "Test summary",
                  title: "Test Article",
                  url: "https://example.com",
                },
              ],
              success: true,
            },
          },
        }),
        contentType: "application/json",
        status: 200,
      });
    });

    // Click individual scraper button
    const tldrButton = page.getByRole("button", { name: /scrape tldr/i });
    await tldrButton.click();

    // Should show loading state on the specific button
    await expect(tldrButton).toBeDisabled();

    // Wait for completion
    await page.waitForTimeout(1000);

    // Clean up routes
    await page.unrouteAll({ behavior: "ignoreErrors" });
  });

  test("should display metrics table", async ({ page }) => {
    await page.waitForLoadState("networkidle");

    // Check for metrics section
    await expect(page.getByText(/scraping metrics/i)).toBeVisible();

    // Check for table headers
    await expect(page.getByText(/source/i)).toBeVisible();
    await expect(page.getByText(/success rate/i)).toBeVisible();
    await expect(page.getByText(/response time/i)).toBeVisible();
    await expect(page.getByText(/items scraped/i)).toBeVisible();

    // Check for source rows (with mock data)
    await expect(page.getByText(/tldr/iu)).toBeVisible();
    await expect(page.getByText(/hacker news/i)).toBeVisible();
    await expect(page.getByText(/morning brew/iu)).toBeVisible();
  });

  test("should display recent content", async ({ page }) => {
    await page.waitForLoadState("networkidle");

    // Check for recent content section
    await expect(page.getByText(/recent content/iu)).toBeVisible();

    // Should show content cards or empty state
    const contentSection = page
      .locator('[data-testid="recent-content"]')
      .or(page.getByText(/no content available/iu))
      .or(page.getByText(/start by scraping/i));

    await expect(contentSection).toBeVisible();
  });

  test("should be keyboard navigable", async ({ page }) => {
    await page.waitForLoadState("networkidle");

    // Start from the first focusable element
    await page.keyboard.press("Tab");

    // Verify focus is visible
    const focusedElement = page.locator(":focus");
    await expect(focusedElement).toBeVisible();

    // Continue tabbing through scraping buttons
    await page.keyboard.press("Tab");
    await page.keyboard.press("Tab");

    // Should be able to navigate to all buttons
    const secondFocusedElement = page.locator(":focus");
    await expect(secondFocusedElement).toBeVisible();
  });

  test("should be responsive on mobile", async ({ page }) => {
    // Test mobile viewport
    await page.setViewportSize({ height: 667, width: 375 });
    await page.reload();
    await page.waitForLoadState("networkidle");

    // Should still show main content
    await expect(page.getByRole("main")).toBeVisible();

    // Metrics should stack vertically on mobile
    await expect(page.getByText(/available scrapers/i)).toBeVisible();
    await expect(page.getByText(/cached content/iu)).toBeVisible();

    // Buttons should be accessible
    await expect(
      page.getByRole("button", { name: /scrape all sources/i })
    ).toBeVisible();
  });

  test("should handle loading states", async ({ page }) => {
    // Intercept API calls to simulate slow loading
    await page.route("**/api/trpc/scraping.**", async (route) => {
      await page.waitForTimeout(100); // Simulate network delay
      await route.continue();
    });

    await page.goto("/scraping");

    // Should show page structure immediately
    await expect(page.getByRole("main")).toBeVisible();
    await expect(page.getByText(/content scraping/i)).toBeVisible();

    // Clean up routes
    await page.unrouteAll({ behavior: "ignoreErrors" });
  });

  test("should have proper heading hierarchy", async ({ page }) => {
    await page.waitForLoadState("networkidle");

    // Check H1 exists and is unique
    const h1Elements = await page.locator("h1").count();
    expect(h1Elements).toBe(1);

    // Check heading levels are logical
    const h1 = page.locator("h1");
    await expect(h1).toBeVisible();

    // Should have some H2s for sections
    const h2Elements = await page.locator("h2").count();
    expect(h2Elements).toBeGreaterThan(0);
  });

  test("should handle error states gracefully", async ({ page }) => {
    // Mock API error
    await page.route("**/api/trpc/scraping.scrapeAll**", async (route) => {
      await route.fulfill({
        body: JSON.stringify({
          error: {
            code: "INTERNAL_SERVER_ERROR",
            message: "Network error",
          },
        }),
        contentType: "application/json",
        status: 500,
      });
    });

    await page.waitForLoadState("networkidle");

    // Click scrape all button
    const scrapeAllButton = page.getByRole("button", {
      name: /scrape all sources/i,
    });
    await scrapeAllButton.click();

    // Should show error state (implementation dependent)
    await page.waitForTimeout(1000);

    // Verify the page still loads correctly despite the error
    await expect(page.locator("h1")).toContainText(/Scraping/u);

    // Clean up routes
    await page.unrouteAll({ behavior: "ignoreErrors" });
  });
});
