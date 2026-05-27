import { expect, test } from "@playwright/test";
import { loginAsAdmin, openCleanLoginPage } from "./helpers/auth";
import {
  activateTrial,
  addDoor,
  createAppUser,
  loginWithCredentials,
  logout,
  selectDoor,
  unlockAndLock,
} from "./helpers/actions";

test("door scoped app users keep role lists separate between doors", async ({ page }) => {
  const secondDoorName = `Role Door ${Date.now()}`;
  const fullAccessEmail = `door-full-${Date.now()}@example.com`;
  const openCloseEmail = `door-open-${Date.now()}@example.com`;
  const appUserPassword = "smart42-temp";

  await openCleanLoginPage(page);
  await loginAsAdmin(page);
  await activateTrial(page);

  // Main Door users.
  await createAppUser(page, {
    name: "Door Scoped Full Access",
    email: fullAccessEmail,
    access: "Full Access",
  });

  await createAppUser(page, {
    name: "Door Scoped Open Close",
    email: openCloseEmail,
  });

  await expect(page.getByText(fullAccessEmail)).toBeVisible();
  await expect(page.getByText(openCloseEmail)).toBeVisible();

  // New door starts with clean App Users list.
  await addDoor(page, secondDoorName);

  await page.getByRole("button", { name: "Settings" }).click();
  await expect(page.getByRole("heading", { name: "Settings" })).toBeVisible();

  await expect(page.getByText(fullAccessEmail)).not.toBeVisible();
  await expect(page.getByText(openCloseEmail)).not.toBeVisible();

  // Main Door restores its own users.
  await selectDoor(page, "Main Door");

  await page.getByRole("button", { name: "Settings" }).click();
  await expect(page.getByRole("heading", { name: "Settings" })).toBeVisible();

  await expect(page.getByText(fullAccessEmail)).toBeVisible();
  await expect(page.getByText(openCloseEmail)).toBeVisible();

  // Full Access user role still works.
  await logout(page);
  await loginWithCredentials(page, fullAccessEmail, appUserPassword);

  await unlockAndLock(page);

  await page.getByRole("button", { name: "Settings" }).click();
  await expect(page.getByRole("heading", { name: "Quick Controls" })).toBeVisible();

  await page.getByRole("button", { name: "Activity" }).click();
  await expect(page.getByRole("heading", { name: "Activity Log" })).toBeVisible();

  await logout(page);

  // Open/Close Only user role still works and cannot access Settings/Activity.
  await loginWithCredentials(page, openCloseEmail, appUserPassword);

  await expect(page.getByRole("button", { name: "Settings" })).toBeDisabled();
  await expect(page.getByRole("button", { name: "Activity" })).toBeDisabled();

  await unlockAndLock(page);
});
