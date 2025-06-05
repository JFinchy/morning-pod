import { test, expect } from "@playwright/test";

test.describe("Visual Regression Tests - Feature Flags", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
  });

  test("should match homepage with all features enabled", async ({
    page,
    browserName,
  }) => {
    // Set environment variables to enable all features
    await page.addInitScript(() => {
      // Mock environment variables for all features enabled
      (window as any).process = {
        env: {
          NODE_ENV: "test",
          PREMIUM_TTS_ENABLED: "true",
          AI_SUMMARIZATION_ENABLED: "true",
          OPENAI_TTS_ENABLED: "true",
          GOOGLE_TTS_ENABLED: "true",
          TLDR_SOURCE_ENABLED: "true",
          HACKER_NEWS_SOURCE_ENABLED: "true",
          MORNING_BREW_SOURCE_ENABLED: "true",
          TECHCRUNCH_SOURCE_ENABLED: "true",
          PREMIUM_CONTENT_ENABLED: "true",
          FREE_CONTENT_ENABLED: "true",
          HIGH_DAILY_LIMITS_ENABLED: "true",
          UNLIMITED_GENERATION_ENABLED: "true",
        },
      };
    });

    await page.reload();
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(1000); // Wait for feature flags to load

    await expect(page).toHaveScreenshot(
      `homepage-all-features-enabled-${browserName}.png`,
      {
        fullPage: true,
        animations: "disabled",
      }
    );
  });

  test("should match homepage with premium features disabled", async ({
    page,
    browserName,
  }) => {
    // Disable premium features
    await page.addInitScript(() => {
      (window as any).process = {
        env: {
          NODE_ENV: "test",
          PREMIUM_TTS_ENABLED: "false",
          AI_SUMMARIZATION_ENABLED: "false",
          OPENAI_TTS_ENABLED: "false",
          PREMIUM_CONTENT_ENABLED: "false",
          UNLIMITED_GENERATION_ENABLED: "false",
          // Keep free features enabled
          GOOGLE_TTS_ENABLED: "true",
          TLDR_SOURCE_ENABLED: "true",
          HACKER_NEWS_SOURCE_ENABLED: "true",
          MORNING_BREW_SOURCE_ENABLED: "true",
          FREE_CONTENT_ENABLED: "true",
        },
      };
    });

    await page.reload();
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(1000);

    await expect(page).toHaveScreenshot(
      `homepage-premium-disabled-${browserName}.png`,
      {
        fullPage: true,
        animations: "disabled",
      }
    );
  });

  test("should match sources page with limited sources", async ({
    page,
    browserName,
  }) => {
    // Enable only free sources
    await page.addInitScript(() => {
      (window as any).process = {
        env: {
          NODE_ENV: "test",
          TLDR_SOURCE_ENABLED: "false",
          HACKER_NEWS_SOURCE_ENABLED: "true",
          MORNING_BREW_SOURCE_ENABLED: "false",
          TECHCRUNCH_SOURCE_ENABLED: "false",
        },
      };
    });

    await page.goto("/sources");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(1000);

    await expect(page).toHaveScreenshot(`sources-limited-${browserName}.png`, {
      fullPage: true,
      animations: "disabled",
    });
  });

  test("should match feature flag admin modal", async ({
    page,
    browserName,
  }) => {
    await page.waitForLoadState("networkidle");

    // Open feature flag admin modal
    const featureFlagButton = page.getByRole("button", {
      name: /feature flags/i,
    });
    await featureFlagButton.click();
    await page.waitForTimeout(500);

    await expect(page).toHaveScreenshot(
      `feature-flag-admin-modal-${browserName}.png`,
      {
        animations: "disabled",
      }
    );
  });

  test("should match feature flag admin modal content", async ({
    page,
    browserName,
  }) => {
    await page.waitForLoadState("networkidle");

    // Open feature flag admin modal
    const featureFlagButton = page.getByRole("button", {
      name: /feature flags/i,
    });
    await featureFlagButton.click();
    await page.waitForTimeout(500);

    // Take screenshot of just the modal content
    const modal = page.locator('[role="dialog"]');
    await expect(modal).toHaveScreenshot(
      `feature-flag-modal-content-${browserName}.png`,
      {
        animations: "disabled",
      }
    );
  });

  test("should match different feature flag states", async ({
    page,
    browserName,
  }) => {
    const scenarios = [
      {
        name: "minimal-features",
        env: {
          NODE_ENV: "test",
          PREMIUM_TTS_ENABLED: "false",
          AI_SUMMARIZATION_ENABLED: "false",
          OPENAI_TTS_ENABLED: "false",
          TLDR_SOURCE_ENABLED: "false",
          MORNING_BREW_SOURCE_ENABLED: "false",
          PREMIUM_CONTENT_ENABLED: "false",
        },
      },
      {
        name: "sources-only",
        env: {
          NODE_ENV: "test",
          TLDR_SOURCE_ENABLED: "true",
          HACKER_NEWS_SOURCE_ENABLED: "true",
          MORNING_BREW_SOURCE_ENABLED: "true",
          TECHCRUNCH_SOURCE_ENABLED: "true",
          // Disable premium features
          PREMIUM_TTS_ENABLED: "false",
          AI_SUMMARIZATION_ENABLED: "false",
          PREMIUM_CONTENT_ENABLED: "false",
        },
      },
      {
        name: "premium-only",
        env: {
          NODE_ENV: "test",
          PREMIUM_TTS_ENABLED: "true",
          AI_SUMMARIZATION_ENABLED: "true",
          OPENAI_TTS_ENABLED: "true",
          PREMIUM_CONTENT_ENABLED: "true",
          // Disable sources
          TLDR_SOURCE_ENABLED: "false",
          HACKER_NEWS_SOURCE_ENABLED: "false",
          MORNING_BREW_SOURCE_ENABLED: "false",
          TECHCRUNCH_SOURCE_ENABLED: "false",
        },
      },
    ];

    for (const scenario of scenarios) {
      await page.addInitScript((env) => {
        (window as any).process = { env };
      }, scenario.env);

      await page.reload();
      await page.waitForLoadState("networkidle");
      await page.waitForTimeout(1000);

      await expect(page).toHaveScreenshot(
        `homepage-${scenario.name}-${browserName}.png`,
        {
          fullPage: true,
          animations: "disabled",
        }
      );
    }
  });

  test("should match responsive feature flag admin", async ({
    page,
    browserName,
  }) => {
    const viewports = [
      { name: "mobile", width: 375, height: 667 },
      { name: "tablet", width: 768, height: 1024 },
      { name: "desktop", width: 1920, height: 1080 },
    ];

    for (const viewport of viewports) {
      await page.setViewportSize(viewport);
      await page.waitForTimeout(300);

      // On mobile, need to open sidebar first
      if (viewport.width < 1024) {
        const menuButton = page.getByLabel("Open navigation menu");
        if (await menuButton.isVisible()) {
          await menuButton.click();
          await page.waitForTimeout(300);
        }
      }

      // Open feature flag admin
      const featureFlagButton = page.getByRole("button", {
        name: /feature flags/i,
      });
      if (await featureFlagButton.isVisible()) {
        await featureFlagButton.click();
        await page.waitForTimeout(500);

        await expect(page).toHaveScreenshot(
          `feature-flag-admin-${viewport.name}-${browserName}.png`,
          {
            animations: "disabled",
          }
        );

        // Close modal for next iteration
        await page.keyboard.press("Escape");
        await page.waitForTimeout(300);
      }
    }
  });

  test("should match error states with feature flags", async ({
    page,
    browserName,
  }) => {
    // Mock API errors
    await page.route("**/api/trpc/**", async (route) => {
      await route.fulfill({
        status: 500,
        contentType: "application/json",
        body: JSON.stringify({ error: "Feature temporarily disabled" }),
      });
    });

    // Disable some features
    await page.addInitScript(() => {
      (window as any).process = {
        env: {
          NODE_ENV: "test",
          PREMIUM_TTS_ENABLED: "false",
          AI_SUMMARIZATION_ENABLED: "false",
        },
      };
    });

    await page.reload();
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(1000);

    await expect(page).toHaveScreenshot(
      `homepage-error-with-flags-${browserName}.png`,
      {
        fullPage: true,
        animations: "disabled",
      }
    );
  });

  test("should match loading states with feature flags", async ({
    page,
    browserName,
  }) => {
    // Slow down requests
    await page.route("**/api/trpc/**", async (route) => {
      await page.waitForTimeout(2000);
      await route.continue();
    });

    // Set specific feature flag state
    await page.addInitScript(() => {
      (window as any).process = {
        env: {
          NODE_ENV: "test",
          PREMIUM_TTS_ENABLED: "true",
          TLDR_SOURCE_ENABLED: "true",
          HACKER_NEWS_SOURCE_ENABLED: "true",
        },
      };
    });

    const navigationPromise = page.goto("/");

    // Capture loading state
    await page.waitForTimeout(500);
    await expect(page).toHaveScreenshot(
      `homepage-loading-with-flags-${browserName}.png`,
      {
        fullPage: true,
        animations: "disabled",
      }
    );

    await navigationPromise;
    await page.unrouteAll({ behavior: "ignoreErrors" });
  });
});
