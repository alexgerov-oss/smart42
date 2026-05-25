import { test } from "@playwright/test";
import { loginAsAdmin, openCleanLoginPage } from "./helpers/auth";

test("unlock and lock send API requests", async ({ page }) => {
  await openCleanLoginPage(page);
  await loginAsAdmin(page);

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
