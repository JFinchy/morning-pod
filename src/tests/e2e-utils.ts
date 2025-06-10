import { expect, Page, test as base } from "@playwright/test";

// Extended test interface with custom fixtures
export const test = base.extend<{
  accessibilityUtils: {
    checkFocusManagement: () => Promise<boolean>;
    scanPage: () => Promise<unknown>;
    verifyKeyboardNavigation: () => Promise<boolean>;
  };
  authenticatedPage: Page;
  mockAPI: void;
  performanceMetrics: void;
}>({
  // Accessibility utilities fixture
  accessibilityUtils: async ({ page }, use) => {
    const utils = {
      checkFocusManagement: async () => {
        // Check if focus is properly managed
        await page.keyboard.press("Tab");
        const focusedElement = page.locator(":focus");
        return (await focusedElement.count()) > 0;
      },

      scanPage: async () => {
        const { AxeBuilder } = await import("@axe-core/playwright");
        return await new AxeBuilder({ page })
          .exclude("[data-headlessui-state]")
          .exclude(".pointer-events-none")
          .analyze();
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
          const focused = page.locator(":focus");
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

  // Mock API fixture
  mockAPI: async ({ page }, use) => {
    // Set up comprehensive API mocking
    await page.route("**/api/trpc/**", async (route) => {
      const url = route.request().url();

      await (url.includes("episodes.getAll")
        ? route.fulfill({
            body: JSON.stringify({
              result: {
                data: {
                  episodes: [
                    {
                      audioUrl: "test-audio.mp3",
                      id: "test-1",
                      status: "completed",
                      summary: "Test summary",
                      title: "Test Episode 1",
                    },
                  ],
                },
              },
            }),
            contentType: "application/json",
            status: 200,
          })
        : route.continue());
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
        addMetric: (name: string, value: number) => {
          (
            (window as unknown as { __performance: { metrics: unknown[] } })
              .__performance.metrics as unknown[]
          ).push({
            name,
            timestamp: Date.now(),
            value,
          });
        },
        metrics: [],
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
      observer.observe({ buffered: true, type: "layout-shift" });
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
});

// Advanced page utilities
class PageUtils {
  constructor(private page: Page) {}

  // Simulate slow network
  async simulateSlowNetwork() {
    const context = this.page.context();
    await context.route("**/*", async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      await route.continue();
    });
  }

  // Comprehensive interaction testing
  async testAllInteractiveElements() {
    const interactions = [];

    // Test buttons
    const buttons = await this.page.locator('button, [role="button"]').all();
    for (const button of buttons.slice(0, 5)) {
      if (await button.isVisible()) {
        await button.hover();
        interactions.push({ action: "hover", success: true, type: "button" });
      }
    }

    // Test links
    const links = await this.page.locator("a[href]").all();
    for (const link of links.slice(0, 3)) {
      if (await link.isVisible()) {
        await link.hover();
        interactions.push({ action: "hover", success: true, type: "link" });
      }
    }

    return interactions;
  }

  // Test responsive breakpoints
  async testResponsiveBreakpoints() {
    const breakpoints = [
      { height: 667, name: "mobile", width: 375 },
      { height: 1024, name: "tablet", width: 768 },
      { height: 800, name: "desktop", width: 1200 },
      { height: 1080, name: "large", width: 1920 },
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

  // Wait for all animations to complete
  async waitForAnimations() {
    await this.page.waitForFunction(() => {
      const elements = document.querySelectorAll("*");
      return [...elements].every((el) => {
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
      const images = [...document.querySelectorAll("img")];
      return images.every((img) => img.complete && img.naturalHeight !== 0);
    });
  }
}

// Theme testing utilities
class ThemeUtils {
  constructor(private page: Page) {}

  async getCurrentTheme() {
    return await this.page.evaluate(() => {
      return (
        document.documentElement.getAttribute("data-theme") ||
        localStorage.getItem("theme") ||
        "default"
      );
    });
  }

  async setTheme(theme: string) {
    await this.page.evaluate((t) => {
      localStorage.setItem("theme", t);
      document.documentElement.setAttribute("data-theme", t);
    }, theme);
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
        applied: appliedTheme === theme,
        contentVisible: isMainVisible,
        theme,
      });
    }

    return results;
  }
}

// Export utilities
export { expect, PageUtils, ThemeUtils };
