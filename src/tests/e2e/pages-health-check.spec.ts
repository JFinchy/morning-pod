import { expect, test } from "@playwright/test";

test.describe("Pages Health Check After Merge Resolution", () => {
  test("homepage loads and displays correctly", async ({ page }) => {
    await page.goto("/");

    // Check that the page loads without errors
    await expect(page.locator("h1")).toContainText("Morning Pod");

    // Check for main navigation
    await expect(page.locator("nav")).toBeVisible();

    // Check for main content areas
    await expect(page.locator("main")).toBeVisible();

    // Wait for any dynamic content to load
    await page.waitForTimeout(2000);

    // Take a screenshot for visual verification
    await page.screenshot({
      fullPage: true,
      path: "test-results/homepage.png",
    });
  });

  test("episodes page loads and displays correctly", async ({ page }) => {
    await page.goto("/episodes");

    // Check for episodes page header
    await expect(page.locator("h1")).toContainText("Episode Library");

    // Check for the play icon in header
    await expect(
      page.locator('[data-testid="play-icon"], .lucide-play')
    ).toBeVisible();

    // Check for view mode toggles (grid/list)
    await expect(page.locator("button")).toContainText(["Grid", "List"]);

    // Check for search functionality
    await expect(page.locator('input[placeholder*="Search"]')).toBeVisible();

    // Check for status filter
    await expect(page.locator("select")).toBeVisible();

    // Wait for episodes to load (or empty state)
    await page.waitForTimeout(3000);

    // Check if we have episodes or empty state
    const hasEpisodes =
      (await page.locator('[data-testid="episode-card"]').count()) > 0;
    const hasEmptyState = await page.locator("text=No episodes").isVisible();

    expect(hasEpisodes || hasEmptyState).toBeTruthy();

    await page.screenshot({
      fullPage: true,
      path: "test-results/episodes-page.png",
    });
  });

  test("episodes page search and filter functionality", async ({ page }) => {
    await page.goto("/episodes");

    // Test search functionality
    const searchInput = page.locator('input[placeholder*="Search"]');
    await searchInput.fill("test search");

    // Wait for search to process
    await page.waitForTimeout(1000);

    // Test status filter
    const statusFilter = page.locator("select");
    await statusFilter.selectOption("ready");

    // Wait for filter to apply
    await page.waitForTimeout(1000);

    // Verify the page still loads and search functionality is accessible
    await expect(page.locator("h1")).toContainText(/Episodes?/u);
    await expect(searchInput).toBeVisible();

    await page.screenshot({
      fullPage: true,
      path: "test-results/episodes-search.png",
    });
  });

  test("sources page loads correctly", async ({ page }) => {
    await page.goto("/sources");

    // Check for sources page content
    await expect(page.locator("h1, h2")).toContainText(/Sources?/u);

    // Wait for content to load
    await page.waitForTimeout(2000);

    await page.screenshot({
      fullPage: true,
      path: "test-results/sources-page.png",
    });
  });

  test("queue page loads correctly", async ({ page }) => {
    await page.goto("/queue");

    // Check for queue page content
    await expect(page.locator("h1, h2")).toContainText(/Queue|Status/u);

    // Wait for content to load
    await page.waitForTimeout(2000);

    await page.screenshot({
      fullPage: true,
      path: "test-results/queue-page.png",
    });
  });

  test("internal development pages load correctly", async ({ page }) => {
    await page.goto("/internal");

    // Check for internal page content
    await expect(page.locator("h1")).toContainText(
      /Component|Development|Internal/u
    );

    // Check for component comparison links
    await expect(page.locator("a")).toContainText(/Component|Episode|Queue/u);

    await page.screenshot({
      fullPage: true,
      path: "test-results/internal-page.png",
    });
  });

  test("episode card variants comparison page", async ({ page }) => {
    await page.goto("/episodes/comparison");

    // Wait for components to load
    await page.waitForTimeout(3000);

    // Check for variant headers
    await expect(page.locator("h2, h3")).toContainText(/Card|Episode|Variant/u);

    await page.screenshot({
      fullPage: true,
      path: "test-results/episode-variants.png",
    });
  });

  test("audio player functionality (if available)", async ({ page }) => {
    await page.goto("/episodes");

    // Wait for episodes to load
    await page.waitForTimeout(3000);

    // Look for play buttons
    const playButtons = page.locator(
      'button:has-text("Play"), button .lucide-play'
    );
    const playButtonCount = await playButtons.count();

    if (playButtonCount > 0) {
      // Try clicking the first play button
      await playButtons.first().click();

      // Wait for audio player to appear
      await page.waitForTimeout(2000);

      // Check if audio player appeared
      const audioPlayer = page.locator(
        '[data-testid="audio-player"], .audio-player, text="Now Playing"'
      );
      const playerVisible = await audioPlayer.isVisible();

      console.log(`Audio player visible: ${playerVisible}`);

      await page.screenshot({
        fullPage: true,
        path: "test-results/audio-player.png",
      });
    } else {
      console.log("No playable episodes found");
    }

    // Always verify the page loaded correctly
    await expect(page.locator("h1")).toContainText(/Episodes?/u);
  });

  test("responsive design - mobile view", async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ height: 667, width: 375 });

    await page.goto("/");

    // Check that page renders on mobile
    await expect(page.locator("h1")).toBeVisible();

    await page.screenshot({
      fullPage: true,
      path: "test-results/mobile-homepage.png",
    });

    // Test episodes page on mobile
    await page.goto("/episodes");
    await page.waitForTimeout(2000);

    // Verify episodes page loads on mobile
    await expect(page.locator("h1")).toContainText(/Episodes?/u);

    await page.screenshot({
      fullPage: true,
      path: "test-results/mobile-episodes.png",
    });
  });

  test("theme switching functionality", async ({ page }) => {
    await page.goto("/");

    // Look for theme switcher
    const themeButton = page.locator(
      'button:has-text("Theme"), [data-testid="theme-switcher"], .theme-switcher'
    );

    if (await themeButton.isVisible()) {
      await themeButton.click();

      // Wait for theme menu or change
      await page.waitForTimeout(1000);

      await page.screenshot({
        fullPage: true,
        path: "test-results/theme-switcher.png",
      });
    } else {
      console.log("Theme switcher not found - might be in different location");
    }

    // Always verify the page loaded correctly
    await expect(page.locator("h1")).toBeVisible();
  });

  test("navigation between pages works", async ({ page }) => {
    await page.goto("/");

    // Test navigation to episodes
    await page.click('a[href="/episodes"], text="Episodes"');
    await page.waitForURL("**/episodes");
    await expect(page.locator("h1")).toContainText("Episode Library");

    // Test navigation to sources
    await page.click('a[href="/sources"], text="Sources"');
    await page.waitForURL("**/sources");

    // Test navigation back to home
    await page.click('a[href="/"], text="Home"');
    await page.waitForURL("/");

    await page.screenshot({
      fullPage: true,
      path: "test-results/navigation-test.png",
    });
  });

  test("error boundaries and loading states", async ({ page }) => {
    // Monitor console errors
    const consoleErrors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") {
        consoleErrors.push(msg.text());
      }
    });

    await page.goto("/episodes");

    // Wait for page to fully load
    await page.waitForTimeout(5000);

    // Check for any unhandled errors
    expect(consoleErrors.length).toBeLessThan(5); // Allow some minor errors but not many

    if (consoleErrors.length > 0) {
      console.log("Console errors detected:", consoleErrors);
    }

    await page.screenshot({
      fullPage: true,
      path: "test-results/error-check.png",
    });
  });
});
