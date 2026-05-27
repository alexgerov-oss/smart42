import { expect, test } from "@playwright/test";
import { loginAsAdmin, openCleanLoginPage } from "./helpers/auth";
import {
  activateTrial,
  addDoor,
  createAppUser,
  createIButton,
  createScene,
  setAutomaticLockToMinimum,
  unlockDoor,
} from "./helpers/actions";

test("trial is global while door data stays scoped", async ({ page }) => {
  const secondDoorName = `Global Plan Door ${Date.now()}`;
  const mainSceneName = `Global Plan Scene ${Date.now()}`;
  const mainIButtonName = `Global Plan iButton ${Date.now()}`;
  const mainUserEmail = `global-plan-user-${Date.now()}@example.com`;

  await openCleanLoginPage(page);
  await loginAsAdmin(page);

  // Before trial, Activity opens the no-plan/upgrade flow.
  await page.getByRole("button", { name: "Activity" }).click();
  await expect(page.getByRole("heading", { name: "Activity" })).toBeVisible();
  await expect(page.getByText("Upgrade to Premium")).toBeVisible();

  // Trial is global.
  await activateTrial(page);

  // Main Door gets door-scoped data.
  await createAppUser(page, {
    name: "Global Plan Door User",
    email: mainUserEmail,
  });

  await createIButton(page, mainIButtonName);
  await createScene(page, mainSceneName);
  await setAutomaticLockToMinimum(page);
  await unlockDoor(page);

  await page.getByRole("button", { name: "Activity" }).click();
  await expect(page.getByRole("heading", { name: "Activity Log" })).toBeVisible();
  await expect(page.getByText("Main Door").first()).toBeVisible();

  // Add Door 2. Trial access remains available, but data/settings start clean.
  await addDoor(page, secondDoorName);

  await page.getByRole("button", { name: "Activity" }).click();
  await expect(page.getByRole("heading", { name: "Activity Log" })).toBeVisible();

  await expect(page.getByText("Upgrade to Premium")).not.toBeVisible();
  await expect(page.getByText("Main Door")).not.toBeVisible();

  await page.getByRole("button", { name: "Settings" }).click();
  await expect(page.getByRole("heading", { name: "Settings" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Quick Controls" })).toBeVisible();

  await expect(page.getByText("Lock Delay")).not.toBeVisible();
  await expect(page.getByText(mainUserEmail)).not.toBeVisible();
  await expect(page.getByText(mainIButtonName)).not.toBeVisible();

  await page.getByRole("button", { name: "Scenes" }).click();
  await expect(page.getByRole("heading", { name: "Scenes" })).toBeVisible();
  await expect(page.getByText(mainSceneName)).not.toBeVisible();

  // Trial is still active on Door 2 because Add Scene/Add User/Add iButton are available.
  await expect(page.getByRole("button", { name: "Add Scene" })).toBeVisible();

  await page.getByRole("button", { name: "Settings" }).click();
  await expect(page.getByRole("button", { name: "Add User" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Add iButton User" })).toBeVisible();
});
