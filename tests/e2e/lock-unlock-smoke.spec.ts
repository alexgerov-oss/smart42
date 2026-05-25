import { expect, test } from "@playwright/test";

test("unlock and lock send API requests", async ({ page }) => {
  await page.goto("/", {
    waitUntil: "domcontentloaded",
  });

  await expect(page.getByRole("heading", { name: "SmartDoor" })).toBeVisible();

  await page.getByLabel("Email").fill("admin@example.com");
  await page.getByLabel("Password").fill("test123");
  await page.getByRole("button", { name: "Login" }).click();

  await expect(page.getByText("SmartDoor Inc.")).toBeVisible();

  const unlockResponsePromise = page.waitForResponse((response) => {
    return (
      response.url().includes("/api/doors/unlock") &&
      response.request().method() === "POST" &&
      response.ok()
    );
  });

  await page.getByText("Unlock", { exact: true }).click();

  await unlockResponsePromise;

  const lockResponsePromise = page.waitForResponse((response) => {
    return (
      response.url().includes("/api/doors/lock") &&
      response.request().method() === "POST" &&
      response.ok()
    );
  });

  await page.getByText("Lock", { exact: true }).click();

  await lockResponsePromise;
});
