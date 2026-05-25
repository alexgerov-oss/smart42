import { expect, test } from "@playwright/test";

test("automatic lock countdown works at minimum delay", async ({ page }) => {
  await page.goto("/", {
    waitUntil: "domcontentloaded",
  });

  await expect(page.getByRole("heading", { name: "SmartDoor" })).toBeVisible();

  await page.getByLabel("Email").fill("admin@example.com");
  await page.getByLabel("Password").fill("test123");
  await page.getByRole("button", { name: "Login" }).click();

  await expect(page.getByText("SmartDoor Inc.")).toBeVisible({ timeout: 15_000 });

  await page.getByRole("button", { name: "Settings" }).click();
  await expect(page.getByRole("heading", { name: "Quick Controls" })).toBeVisible();

  await page.getByLabel("Automatic Lock").click();

  await expect(page.getByText("Lock Delay")).toBeVisible();

  const slider = page.getByRole("slider");
  await slider.focus();
  await page.keyboard.press("Home");

  await expect(page.getByText("5s")).toBeVisible();

  await page.getByRole("button", { name: "Home" }).click();
  await expect(page.getByText("SmartDoor Inc.")).toBeVisible({ timeout: 15_000 });

  const unlockResponsePromise = page.waitForResponse((response) => {
    return (
      response.url().includes("/api/doors/unlock") &&
      response.request().method() === "POST" &&
      response.ok()
    );
  });

  await page.getByText("Unlock", { exact: true }).click();

  await unlockResponsePromise;

  await expect(page.getByText("Automatic lock")).toBeVisible();
  await expect(page.getByText(/5s|4s|3s|2s|1s/)).toBeVisible();

  await expect(page.getByText("Automatic lock")).not.toBeVisible({
    timeout: 8_000,
  });
});
