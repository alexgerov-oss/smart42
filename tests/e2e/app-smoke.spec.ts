import { expect, test } from "@playwright/test";

test("app loads without crashing", async ({ page }) => {
  const runtimeErrors: string[] = [];

  page.on("pageerror", (error) => {
    runtimeErrors.push(error.message);
  });

  const response = await page.goto("/", {
    waitUntil: "domcontentloaded",
  });

  expect(response?.ok()).toBeTruthy();

  await expect(page.locator("body")).toBeVisible();

  await expect(page.locator("body")).not.toContainText(
    /Application error|Unhandled Runtime Error|ReferenceError|TypeError/i,
  );

  expect(runtimeErrors).toEqual([]);
});
