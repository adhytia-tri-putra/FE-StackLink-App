import { expect, test } from "@playwright/test";

test("renders legal content", async ({ page }) => {
  await page.goto("/privacy");
  await expect(page.getByRole("heading", { name: "Privacy Policy" })).toBeVisible();
});

test("redirects a guest away from the dashboard", async ({ page }) => {
  await page.goto("/dashboard");
  await expect(page).toHaveURL(/\/login$/);
  await expect(page.getByRole("button", { name: /sign in/i })).toBeVisible();
});

test("registers and verifies a new account", async ({ page }) => {
  await page.route("**/api/auth/register", async (route) => route.fulfill({
    status: 201,
    contentType: "application/json",
    body: JSON.stringify({ success: true, data: { developmentToken: "e2e-token" } }),
  }));
  await page.route("**/api/auth/verify-email", async (route) => route.fulfill({
    status: 200,
    contentType: "application/json",
    body: JSON.stringify({ success: true }),
  }));

  await page.goto("/register");
  await page.getByLabel("Full Name").fill("E2E User");
  await page.getByLabel("Email").fill("e2e@example.com");
  await page.getByLabel("Password").fill("StrongPass123!");
  await page.getByRole("checkbox").check();
  await page.getByRole("button", { name: "Create Account" }).click();
  await expect(page).toHaveURL(/verify-email\?token=e2e-token/);
  await expect(page.getByText(/Email verified successfully/i)).toBeVisible();
});
