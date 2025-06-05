import { test, expect } from "@playwright/test";

test.describe("Visual Regression Tests", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
  });

  test("should match homepage screenshots across themes", async ({
    page,
    browserName,
  }) => {
    const themes = ["forest", "dark", "light", "cyberpunk"];

    for (const theme of themes) {
      // Set theme
      await page.evaluate((t) => {
        localStorage.setItem("theme", t);
        document.documentElement.setAttribute("data-theme", t);
      }, theme);

      await page.reload();
      await page.waitForLoadState("networkidle");
      await page.waitForTimeout(500); // Wait for theme application

      // Take full page screenshot
      await expect(page).toHaveScreenshot(
        `homepage-${theme}-${browserName}.png`,
        {
          fullPage: true,
          animations: "disabled",
        }
      );
    }
  });

  test("should match responsive layouts", async ({ page, browserName }) => {
    const viewports = [
      { name: "mobile", width: 375, height: 667 },
      { name: "tablet", width: 768, height: 1024 },
      { name: "desktop", width: 1920, height: 1080 },
    ];

    for (const viewport of viewports) {
      await page.setViewportSize(viewport);
      await page.waitForTimeout(300); // Wait for responsive changes

      await expect(page).toHaveScreenshot(
        `homepage-${viewport.name}-${browserName}.png`,
        {
          fullPage: true,
          animations: "disabled",
        }
      );
    }
  });

  test("should match component hover states", async ({ page, browserName }) => {
    await page.waitForLoadState("networkidle");

    // Skip hover tests on mobile (touch devices don't have hover)
    const viewport = page.viewportSize();
    if (viewport && viewport.width < 768) {
      console.log("Skipping hover tests on mobile devices");
      return;
    }

    // On smaller screens, open sidebar first to access theme switcher
    if (viewport && viewport.width < 1024) {
      const menuButton = page.getByLabel("Open navigation menu");
      if (await menuButton.isVisible()) {
        await menuButton.click();
        await page.waitForTimeout(300);
      }
    }

    // Hover over theme switcher
    const themeSwitcher = page.getByRole("button", { name: /change theme/i });
    if (await themeSwitcher.isVisible()) {
      await themeSwitcher.scrollIntoViewIfNeeded();
      await themeSwitcher.hover();
      await page.waitForTimeout(200);

      await expect(page).toHaveScreenshot(
        `theme-switcher-hover-${browserName}.png`,
        {
          clip: { x: 0, y: 0, width: 400, height: 100 },
        }
      );
    }

    // Hover over navigation items
    const navItems = await page.getByRole("navigation").getByRole("link").all();
    for (let i = 0; i < Math.min(navItems.length, 2); i++) {
      const item = navItems[i];
      if (await item.isVisible()) {
        await item.hover();
        await page.waitForTimeout(200);

        await expect(page).toHaveScreenshot(
          `nav-item-${i}-hover-${browserName}.png`,
          {
            clip: { x: 0, y: 0, width: 300, height: 200 },
          }
        );
      }
    }
  });

  test("should match focus states for accessibility", async ({
    page,
    browserName,
  }) => {
    await page.waitForLoadState("networkidle");

    // Tab through focusable elements
    const focusableElements = ["first", "second", "third"];

    for (let i = 0; i < focusableElements.length; i++) {
      await page.keyboard.press("Tab");
      await page.waitForTimeout(200);

      await expect(page).toHaveScreenshot(
        `focus-state-${focusableElements[i]}-${browserName}.png`,
        {
          clip: { x: 0, y: 0, width: 800, height: 600 },
        }
      );
    }
  });

  test("should match error states", async ({ page, browserName }) => {
    // Mock API to return errors
    await page.route("**/api/trpc/**", async (route) => {
      await route.fulfill({
        status: 500,
        contentType: "application/json",
        body: JSON.stringify({ error: "Internal server error" }),
      });
    });

    await page.reload();
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(1000); // Wait for error state

    await expect(page).toHaveScreenshot(
      `homepage-error-state-${browserName}.png`,
      {
        fullPage: true,
        animations: "disabled",
      }
    );
  });

  test("should match loading states", async ({ page, browserName }) => {
    // Slow down requests to capture loading states
    await page.route("**/api/trpc/**", async (route) => {
      await page.waitForTimeout(2000); // 2 second delay
      await route.continue();
    });

    const navigationPromise = page.goto("/");

    // Take screenshot during loading
    await page.waitForTimeout(500);
    await expect(page).toHaveScreenshot(
      `homepage-loading-state-${browserName}.png`,
      {
        fullPage: true,
        animations: "disabled",
      }
    );

    await navigationPromise;

    // Clean up routes
    await page.unrouteAll({ behavior: "ignoreErrors" });
  });
});
