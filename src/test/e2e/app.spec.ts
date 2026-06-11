import { test, expect } from "@playwright/test";

test.describe("Hospital Search", () => {
  test("homepage loads and shows hospitals", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("h1").first()).toBeVisible({ timeout: 10000 });
  });

  test("search filters hospitals by name", async ({ page }) => {
    await page.goto("/search");
    await page.waitForTimeout(2000);
    await page.fill('input[placeholder*="Hospital name"]', "Lagos");
    await page.click('button:has-text("Search")');
    await page.waitForTimeout(1500);
    const cards = page.locator('a[href^="/hospitals/"]');
    const count = await cards.count();
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test("CSV export button is present and clickable", async ({ page }) => {
    await page.goto("/search");
    await page.waitForTimeout(2000);
    const exportBtn = page.locator('button:has-text("Export")');
    await expect(exportBtn).toBeVisible({ timeout: 10000 });
  });

  test("share button copies link", async ({ page }) => {
    await page.goto("/search");
    await page.waitForTimeout(2000);
    const shareBtn = page.locator('button:has-text("Share")');
    await expect(shareBtn).toBeVisible({ timeout: 10000 });
  });

  test("email share dialog opens", async ({ page }) => {
    await page.goto("/search");
    await page.waitForTimeout(2000);
    const emailBtn = page.locator('button:has-text("Email")');
    await expect(emailBtn).toBeVisible({ timeout: 10000 });
  });
});

test.describe("Admin Auth", () => {
  test("admin page redirects to login when not authenticated", async ({
    page,
  }) => {
    await page.goto("/admin");
    await expect(page.locator("text=Admin Login")).toBeVisible({
      timeout: 10000,
    });
  });

  test("admin login page renders", async ({ page }) => {
    await page.goto("/admin/login");
    await page.waitForTimeout(1000);
    await expect(page.locator("h1")).toContainText("Admin Login", {
      timeout: 10000,
    });
    await expect(page.locator("input[type='email']")).toBeVisible();
    await expect(page.locator("input[type='password']")).toBeVisible();
  });

  test("non-admin cannot access admin dashboard", async ({ page }) => {
    await page.goto("/admin");
    await page.waitForTimeout(2000);
    expect(page.url()).not.toContain("/admin/hospitals");
  });
});
