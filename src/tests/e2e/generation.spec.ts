import { expect, test } from "@playwright/test";

test.describe("Episode Generation E2E", () => {
  test.beforeEach(async ({ page }) => {
    // Enable API mocking via environment variable if possible,
    // or we'll handle it via page.route
    await page.goto("/discover");
  });

  test("should open generation modal and show progress", async ({ page }) => {
    // Wait for stories to load
    await page.waitForLoadState("networkidle");

    // Click the first "Develop" button (Zap icon)
    const developButton = page
      .locator('button[aria-label="Develop Briefing"]')
      .first();
    await expect(developButton).toBeVisible();
    await developButton.click();

    // Verify modal is open
    await expect(page.getByText(/generate new episode/i)).toBeVisible();

    // The modal should auto-start if autoStart is true (which it is in Discover)
    // or we might need to click generate.
    // Let's check for progress indicators
    const progressBar = page.locator(".progress");
    await expect(progressBar).toBeVisible();

    // Mock the streaming response if needed to speed up tests or avoid real AI calls
    // But since we have NEXT_PUBLIC_ENABLE_API_MOCKING, we'll assume it's using the mock route

    // Check for progress text updates
    await expect(
      page.getByText(/%|processing|scraping|summarizing/i)
    ).toBeVisible();

    // Wait for completion (the mock route is fast)
    await expect(page.getByText(/episode generated successfully/i)).toBeVisible(
      { timeout: 15000 }
    );

    // Check for action buttons
    await expect(
      page.getByRole("button", { name: /play briefing/i })
    ).toBeVisible();
    await expect(page.getByRole("button", { name: /download/i })).toBeVisible();
    await expect(
      page.getByRole("button", { name: /detail page/i })
    ).toBeVisible();
  });

  test("should persist progress in the library view", async ({ page }) => {
    // 1. Start a generation
    await page.goto("/discover");
    const developButton = page
      .locator('button[aria-label="Develop Briefing"]')
      .first();
    await developButton.click();

    // 2. Wait for it to actually start
    await expect(page.locator(".progress")).toBeVisible();

    // 3. Close the modal (mocking the "Cancel" or "Close" behavior)
    // or just navigate away
    await page.goto("/episodes");

    // 4. Look for the generating episode in the library
    // It should have a progress bar or "Generating" status
    await expect(page.getByText(/generating/i)).toBeVisible();

    // 5. It should eventually become "Ready"
    await expect(
      page.getByRole("button", { name: /listen now/i }).first()
    ).toBeVisible({ timeout: 15000 });
  });
});
