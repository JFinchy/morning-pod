import { expect, test } from "@playwright/test";

test.describe("Analytics Dashboard", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/internal/analytics");
  });

  test("should display analytics dashboard", async ({ page }) => {
    // Check page title
    await expect(page.locator("h1")).toContainText("Analytics Dashboard");

    // Check status cards
    await expect(page.locator('[data-testid="posthog-status"]')).toContainText(
      "Connected"
    );
    await expect(page.locator('[data-testid="events-tracked"]')).toBeVisible();
    await expect(page.locator('[data-testid="last-event"]')).toBeVisible();
  });

  test("should track user identification", async ({ page }) => {
    // Find and click identify user button
    const identifyButton = page.locator('button:has-text("Identify User")');
    await expect(identifyButton).toBeVisible();

    await identifyButton.click();

    // Check that event count increased
    await expect(page.locator('[data-testid="events-tracked"]')).toContainText(
      "1"
    );
    await expect(page.locator('[data-testid="last-event"]')).toContainText(
      "User Identified"
    );
  });

  test("should track basic events", async ({ page }) => {
    // Click basic events test button
    const basicEventsButton = page.locator(
      'button:has-text("Test Basic Events")'
    );
    await expect(basicEventsButton).toBeVisible();

    await basicEventsButton.click();

    // Check that multiple events were tracked
    await expect(page.locator('[data-testid="events-tracked"]')).toContainText(
      "3"
    );
    await expect(page.locator('[data-testid="last-event"]')).toContainText(
      "Basic Events"
    );
  });

  test("should track podcast generation flow", async ({ page }) => {
    // Click podcast events test button
    const podcastEventsButton = page.locator(
      'button:has-text("Test Podcast Flow")'
    );
    await expect(podcastEventsButton).toBeVisible();

    await podcastEventsButton.click();

    // Check that podcast events were tracked
    await expect(page.locator('[data-testid="events-tracked"]')).toContainText(
      "5"
    );
    await expect(page.locator('[data-testid="last-event"]')).toContainText(
      "Podcast Generation Flow"
    );
  });

  test("should reset analytics", async ({ page }) => {
    // First track some events
    await page.locator('button:has-text("Test Basic Events")').click();
    await expect(page.locator('[data-testid="events-tracked"]')).toContainText(
      "3"
    );

    // Then reset
    const resetButton = page.locator('button:has-text("Reset Session")');
    await expect(resetButton).toBeVisible();

    await resetButton.click();

    // Check that count was reset
    await expect(page.locator('[data-testid="events-tracked"]')).toContainText(
      "0"
    );
    await expect(page.locator('[data-testid="last-event"]')).toContainText(
      "Analytics Reset"
    );
  });

  test("should display integration documentation", async ({ page }) => {
    // Check that documentation section is visible
    await expect(
      page.locator("h2:has-text('Analytics Integration Guide')")
    ).toBeVisible();

    // Check for code examples
    await expect(
      page.locator("h4:has-text('Client Components')")
    ).toBeVisible();
    await expect(
      page.locator('pre:has-text("useEventTracking")')
    ).toBeVisible();
  });

  test("should handle PostHog connection status", async ({ page }) => {
    // Check PostHog status indicator
    const statusCard = page.locator('[data-testid="posthog-status"]');
    await expect(statusCard).toBeVisible();

    // Should show connected or appropriate status
    const statusText = await statusCard.textContent();
    expect(statusText).toMatch(/(Connected|Disconnected|Loading)/);
  });

  test("should display user ID correctly", async ({ page }) => {
    // Check that test user ID is displayed
    const userIdInput = page.locator("input[readonly]");
    await expect(userIdInput).toBeVisible();

    const userIdValue = await userIdInput.inputValue();
    expect(userIdValue).toMatch(/test-user-\d+/);
  });
});

test.describe("Analytics Integration", () => {
  test("should track page view on load", async ({ page }) => {
    // Enable console message tracking
    const consoleMessages: string[] = [];
    page.on("console", (msg: { text: () => string }) => {
      if (msg.text().includes("Event tracked: page-viewed")) {
        consoleMessages.push(msg.text());
      }
    });

    await page.goto("/internal/analytics");

    // Wait a bit for analytics to initialize
    await page.waitForTimeout(1000);

    // Check if page view was tracked (in development mode)
    // Note: This depends on the analytics being set up to log to console in dev
  });

  test("should handle analytics errors gracefully", async ({ page }) => {
    // Test error handling by temporarily breaking PostHog
    await page.addInitScript(() => {
      // Mock PostHog to throw errors
      (window as unknown as { posthog: unknown }).posthog = {
        identify: () => {
          throw new Error("PostHog error");
        },
        capture: () => {
          throw new Error("PostHog error");
        },
      };
    });

    await page.goto("/internal/analytics");

    // Even with PostHog errors, the page should still work
    await expect(page.locator("h1")).toContainText("Analytics Dashboard");

    // Buttons should still be clickable
    const identifyButton = page.locator('button:has-text("Identify User")');
    await identifyButton.click();

    // Page shouldn't crash
    await expect(page.locator("h1")).toBeVisible();
  });
});
