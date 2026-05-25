import { expect, type Page } from "@playwright/test";

export async function openCleanLoginPage(page: Page) {
  await page.context().clearCookies();

  await page.goto("/", {
    waitUntil: "domcontentloaded",
  });

  await page.evaluate(() => {
    window.localStorage.clear();
    window.sessionStorage.clear();
  });

  await page.reload({
    waitUntil: "domcontentloaded",
  });

  await expect(page.getByRole("heading", { name: "SmartDoor" })).toBeVisible({
    timeout: 15_000,
  });
}

export async function loginAsAdmin(page: Page) {
  const passwords = ["test123", "smart42-temp", "admin-test123"];

  for (const password of passwords) {
    await page.getByLabel("Email").fill("admin@example.com");
    await page.getByLabel("Password").fill(password);
    await page.getByRole("button", { name: "Login" }).click();

    const homeVisible = await page
      .getByText("SmartDoor Inc.")
      .isVisible({ timeout: 3_000 })
      .catch(() => false);

    if (homeVisible) return;
  }

  await expect(page.getByText("SmartDoor Inc.")).toBeVisible({
    timeout: 15_000,
  });
}
