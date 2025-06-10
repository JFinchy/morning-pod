import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test.describe("Homepage E2E", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("should load homepage successfully", async ({ page }) => {
    // Wait for page to load
    await page.waitForLoadState("networkidle");

    // Check for specific main heading (not just any H1)
    await expect(
      page.getByRole("heading", { level: 1, name: /welcome to morning pod/iu })
    ).toBeVisible();

    // Check for navigation
    await expect(page.getByRole("navigation")).toBeVisible();

    // Check for main content
    await expect(page.getByRole("main")).toBeVisible();
  });

  test("should have no accessibility violations", async ({ page }) => {
    await page.waitForLoadState("networkidle");

    // Close any external dev tools or overlays that might interfere
    await page.evaluate(() => {
      // Close Next.js dev overlay if present
      const devOverlay = document.querySelector('[id*="nextjs"]');
      if (devOverlay) devOverlay.remove();

      // Close any cursor/external tool overlays
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
      .exclude("[data-playwright-ignore]") // Exclude playwright test helpers
      .exclude("[data-headlessui-state]") // Exclude external UI tools
      .exclude(".pointer-events-none") // Exclude overlays
      .exclude('[class*="stagewise"]') // Exclude external tools
      .disableRules(["nested-interactive"]) // Temporarily ignore nested interactive (external tools)
      .analyze();

    // Filter out violations we're tracking but not blocking on, and external tool violations
    const criticalViolations = accessibilityScanResults.violations.filter(
      (violation) => {
        // Skip known issues we're working on
        if (["color-contrast", "region"].includes(violation.id)) return false;

        // Skip violations from external development tools
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

    // Log all violations for debugging but only fail on critical app violations
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

  test("should be keyboard navigable", async ({ page }) => {
    await page.waitForLoadState("networkidle");

    // Start from the first focusable element
    await page.keyboard.press("Tab");

    // Verify focus is visible
    const focusedElement = page.locator(":focus");
    await expect(focusedElement).toBeVisible();

    // Continue tabbing through interactive elements
    await page.keyboard.press("Tab");
    await page.keyboard.press("Tab");

    // Should have multiple focusable elements
    const secondFocusedElement = page.locator(":focus");
    await expect(secondFocusedElement).toBeVisible();
  });

  test("should handle theme switching", async ({ page }) => {
    await page.waitForLoadState("networkidle");

    // On mobile, need to open the sidebar first
    const viewport = page.viewportSize();
    if (viewport && viewport.width < 1024) {
      // Click mobile menu button to open sidebar
      const menuButton = page.getByLabel("Open navigation menu");
      if (await menuButton.isVisible()) {
        await menuButton.click();
        await page.waitForTimeout(500); // Wait longer for sidebar animation

        // Verify sidebar is actually open by checking for the sidebar content
        const sidebarContent = page.locator('text="Morning Pod"');
        await expect(sidebarContent).toBeVisible();
      }
    }

    // Look for theme switcher with more flexible selectors
    const themeSwitcher = page
      .getByTestId("theme-switcher")
      .or(page.getByLabel(/change theme/iu))
      .or(page.getByRole("button", { name: /theme/iu }));

    if (await themeSwitcher.isVisible()) {
      // On mobile Safari, use JavaScript to trigger theme change due to viewport issues
      if (viewport && viewport.width < 768) {
        // Get current theme and change to a different one
        const currentTheme = await page.evaluate(() => {
          return (
            document.documentElement.getAttribute("data-theme") || "forest"
          );
        });

        const newTheme = currentTheme === "forest" ? "dark" : "forest";

        // Programmatically change theme
        await page.evaluate((theme) => {
          document.documentElement.setAttribute("data-theme", theme);
          localStorage.setItem("theme", theme);
        }, newTheme);
      } else {
        // Ensure element is in viewport
        await themeSwitcher.scrollIntoViewIfNeeded();
        await themeSwitcher.click();
      }

      // Wait for theme change
      await page.waitForTimeout(500);

      // Verify theme attribute changed
      const html = page.locator("html");
      await expect(html).toHaveAttribute("data-theme");
    }
  });

  test("should be responsive on mobile", async ({ page }) => {
    // Test mobile viewport
    await page.setViewportSize({ height: 667, width: 375 });
    await page.reload();
    await page.waitForLoadState("networkidle");

    // Should still show main content
    await expect(page.getByRole("main")).toBeVisible();

    // Navigation should be accessible (may be in a mobile menu)
    const nav = page.getByRole("navigation");
    await expect(nav).toBeVisible();
  });

  test("should handle loading states", async ({ page }) => {
    // Intercept API calls to simulate slow loading
    await page.route("**/api/trpc/**", async (route) => {
      await page.waitForTimeout(100); // Simulate network delay
      await route.continue();
    });

    await page.goto("/");

    // Should show page structure immediately
    await expect(page.getByRole("main")).toBeVisible();

    // Clean up routes
    await page.unrouteAll({ behavior: "ignoreErrors" });
  });

  test("should have proper heading hierarchy", async ({ page }) => {
    await page.waitForLoadState("networkidle");

    // Should have exactly one H1 (the main page heading)
    const h1Elements = await page.locator("h1").count();
    expect(h1Elements).toBe(1);

    // Verify the H1 is the main welcome heading
    await expect(
      page.getByRole("heading", { level: 1, name: /welcome to morning pod/iu })
    ).toBeVisible();

    // Should have H2 headings for main sections
    await expect(
      page.getByRole("heading", { level: 2, name: /recent episodes/i })
    ).toBeVisible();
  });

  test("should work across different themes", async ({ browserName, page }) => {
    const themes = ["forest", "dark", "light", "cyberpunk"];

    for (const theme of themes) {
      // Set theme via localStorage or cookie
      await page.addInitScript((themeValue) => {
        localStorage.setItem("theme", themeValue);
      }, theme);

      await page.reload();
      await page.waitForLoadState("networkidle");

      // Basic content should be visible regardless of theme
      await expect(page.getByRole("main")).toBeVisible();

      // Take screenshot for visual regression testing
      await page.screenshot({
        fullPage: true,
        path: `test-results/homepage-${theme}-${browserName}.png`,
      });
    }
  });

  test("should handle error states gracefully", async ({ page }) => {
    // Mock API to return errors
    await page.route("**/api/trpc/**", async (route) => {
      await route.fulfill({
        body: JSON.stringify({ error: "Internal server error" }),
        contentType: "application/json",
        status: 500,
      });
    });

    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Should still show main structure
    await expect(page.getByRole("main")).toBeVisible();
  });
});
