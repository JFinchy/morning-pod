import { test, expect } from "@playwright/test";

test.describe("Homepage", () => {
  test("should display welcome message", async ({ page }) => {
    await page.goto("/");

    // Check that the page title contains the project name
    await expect(page).toHaveTitle(/{{projectName}}/);

    // Check for the welcome heading
    await expect(
      page.getByRole("heading", { name: /welcome to {{projectName}}/i })
    ).toBeVisible();
  });

  test("should have working navigation", async ({ page }) => {
    await page.goto("/");

    // Check that key elements are visible
    await expect(page.getByText("Next.js 15")).toBeVisible();
    await expect(page.getByText("TypeScript")).toBeVisible();
    await expect(page.getByText("Tailwind + DaisyUI")).toBeVisible();
  });

  test("should be responsive", async ({ page }) => {
    // Test desktop view
    await page.setViewportSize({ width: 1200, height: 800 });
    await page.goto("/");
    await expect(page.getByRole("heading")).toBeVisible();

    // Test mobile view
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page.getByRole("heading")).toBeVisible();
  });
});
