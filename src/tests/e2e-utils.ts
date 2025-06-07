import { test as base, expect, Page } from "@playwright/test";

// Extended test interface with custom fixtures
export const test = base.extend<{
  authenticatedPage: Page;
  mockAPI: void;
  performanceMetrics: void;
  accessibilityUtils: {
    scanPage: () => Promise<unknown>;
    checkFocusManagement: () => Promise<boolean>;
    verifyKeyboardNavigation: () => Promise<boolean>;
  };
}>({
  // Mock API fixture
  mockAPI: async ({ page }, use) => {
    // Set up comprehensive API mocking
    await page.route("**/api/trpc/**", async (route) => {
      const url = route.request().url();

      if (url.includes("episodes.getAll")) {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            result: {
              data: {
                episodes: [
                  {
                    id: "test-1",
                    title: "Test Episode 1",
                    summary: "Test summary",
                    status: "completed",
                    audioUrl: "test-audio.mp3",
                  },
                ],
              },
            },
          }),
        });
      } else {
        await route.continue();
      }
    });

    // eslint-disable-next-line react-hooks/rules-of-hooks -- false positive: this is Playwright's fixture API, not a React hook
    await use();
  },

  // Performance metrics fixture
  performanceMetrics: async ({ page }, use) => {
    // Start performance monitoring
    await page.addInitScript(() => {
      // Track Core Web Vitals
      (window as unknown as { __performance: unknown }).__performance = {
        metrics: [],
        addMetric: (name: string, value: number) => {
          (
            (window as unknown as { __performance: { metrics: unknown[] } })
              .__performance.metrics as unknown[]
          ).push({
            name,
            value,
            timestamp: Date.now(),
          });
        },
      };

      // Monitor CLS
      let clsValue = 0;
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === "layout-shift") {
            clsValue += (entry as unknown as { value: number }).value;
          }
        }
        (
          (
            window as unknown as {
              __performance: {
                addMetric: (name: string, value: number) => void;
              };
            }
          ).__performance.addMetric as (name: string, value: number) => void
        )("CLS", clsValue);
      });
      observer.observe({ type: "layout-shift", buffered: true });
    });

    // eslint-disable-next-line react-hooks/rules-of-hooks -- false positive: this is Playwright's fixture API, not a React hook
    await use();

    // Collect performance metrics at the end
    const metrics = await page.evaluate(
      () =>
        (window as unknown as { __performance?: { metrics?: unknown[] } })
          .__performance?.metrics || []
    );
    console.log("📊 Performance Metrics:", metrics);
  },

  // Accessibility utilities fixture
  accessibilityUtils: async ({ page }, use) => {
    const utils = {
      scanPage: async () => {
        const { AxeBuilder } = await import("@axe-core/playwright");
        const results = await new AxeBuilder({ page })
          .exclude("[data-headlessui-state]")
          .exclude(".pointer-events-none")
          .analyze();
        return results;
      },

      checkFocusManagement: async () => {
        // Check if focus is properly managed
        await page.keyboard.press("Tab");
        const focusedElement = await page.locator(":focus");
        return (await focusedElement.count()) > 0;
      },

      verifyKeyboardNavigation: async () => {
        // Test keyboard navigation through interactive elements
        const interactiveElements = await page
          .locator(
            'button, a, input, select, textarea, [tabindex]:not([tabindex="-1"])'
          )
          .count();

        let navigableElements = 0;
        for (let i = 0; i < Math.min(interactiveElements, 10); i++) {
          await page.keyboard.press("Tab");
          const focused = await page.locator(":focus");
          if ((await focused.count()) > 0) {
            navigableElements++;
          }
        }

        return navigableElements > 0;
      },
    };

    // eslint-disable-next-line react-hooks/rules-of-hooks -- false positive: this is Playwright's fixture API, not a React hook
    await use(utils);
  },
});

// Advanced page utilities
class PageUtils {
  constructor(private page: Page) {}

  // Wait for all animations to complete
  async waitForAnimations() {
    await this.page.waitForFunction(() => {
      const elements = document.querySelectorAll("*");
      return Array.from(elements).every((el) => {
        const style = getComputedStyle(el);
        return (
          style.animationPlayState !== "running" &&
          style.transitionProperty === "none"
        );
      });
    });
  }

  // Wait for all images to load
  async waitForImages() {
    await this.page.waitForFunction(() => {
      const images = Array.from(document.querySelectorAll("img"));
      return images.every((img) => img.complete && img.naturalHeight !== 0);
    });
  }

  // Simulate slow network
  async simulateSlowNetwork() {
    const context = this.page.context();
    await context.route("**/*", async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      await route.continue();
    });
  }

  // Test responsive breakpoints
  async testResponsiveBreakpoints() {
    const breakpoints = [
      { name: "mobile", width: 375, height: 667 },
      { name: "tablet", width: 768, height: 1024 },
      { name: "desktop", width: 1200, height: 800 },
      { name: "large", width: 1920, height: 1080 },
    ];

    const results = [];
    for (const breakpoint of breakpoints) {
      await this.page.setViewportSize(breakpoint);
      await this.page.waitForTimeout(300);

      const isVisible = await this.page.getByRole("main").isVisible();
      results.push({ ...breakpoint, isVisible });
    }

    return results;
  }

  // Comprehensive interaction testing
  async testAllInteractiveElements() {
    const interactions = [];

    // Test buttons
    const buttons = await this.page.locator('button, [role="button"]').all();
    for (const button of buttons.slice(0, 5)) {
      if (await button.isVisible()) {
        await button.hover();
        interactions.push({ type: "button", action: "hover", success: true });
      }
    }

    // Test links
    const links = await this.page.locator("a[href]").all();
    for (const link of links.slice(0, 3)) {
      if (await link.isVisible()) {
        await link.hover();
        interactions.push({ type: "link", action: "hover", success: true });
      }
    }

    return interactions;
  }
}

// Theme testing utilities
class ThemeUtils {
  constructor(private page: Page) {}

  async setTheme(theme: string) {
    await this.page.evaluate((t) => {
      localStorage.setItem("theme", t);
      document.documentElement.setAttribute("data-theme", t);
    }, theme);
  }

  async getCurrentTheme() {
    return await this.page.evaluate(() => {
      return (
        document.documentElement.getAttribute("data-theme") ||
        localStorage.getItem("theme") ||
        "default"
      );
    });
  }

  async testAllThemes() {
    const themes = ["forest", "dark", "light", "cyberpunk"];
    const results = [];

    for (const theme of themes) {
      await this.setTheme(theme);
      await this.page.waitForTimeout(300);

      const appliedTheme = await this.getCurrentTheme();
      const isMainVisible = await this.page.getByRole("main").isVisible();

      results.push({
        theme,
        applied: appliedTheme === theme,
        contentVisible: isMainVisible,
      });
    }

    return results;
  }
}

// Export utilities
export { expect, PageUtils, ThemeUtils };
