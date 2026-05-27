import { expect, test } from "@playwright/test";
import { loginAsAdmin, openCleanLoginPage } from "./helpers/auth";
import {
  activateTrial,
  addDoor,
  lockDoor,
  lockQuickControls,
  selectDoor,
  setAutomaticLockToMinimum,
  unlockDoor,
} from "./helpers/actions";

test("door scoped state keeps activity, lock settings and quick controls separate", async ({ page }) => {
  const secondDoorName = `Door Two ${Date.now()}`;

  await openCleanLoginPage(page);
  await loginAsAdmin(page);
  await activateTrial(page);

  // Main Door gets its own settings and activity.
  await setAutomaticLockToMinimum(page);
  await lockQuickControls(page);
  await unlockDoor(page);

  await page.getByRole("button", { name: "Activity" }).click();
  await expect(page.getByRole("heading", { name: "Activity Log" })).toBeVisible();
  await expect(page.getByText("Main Door").first()).toBeVisible();

  // Add Door 2. It should start clean.
  await addDoor(page, secondDoorName);

  await page.getByRole("button", { name: "Settings" }).click();
  await expect(page.getByRole("heading", { name: "Quick Controls" })).toBeVisible();

  await expect(page.getByText("Lock Delay")).not.toBeVisible();
  await expect(page.getByRole("button", { name: "Press to Lock" })).toBeVisible();

  await page.getByRole("button", { name: "Activity" }).click();
  await expect(page.getByRole("heading", { name: "Activity Log" })).toBeVisible();
  await expect(page.getByText("Main Door")).not.toBeVisible();

  // Door 2 gets its own activity.
  await unlockDoor(page);

  await page.getByRole("button", { name: "Activity" }).click();
  await expect(page.getByRole("heading", { name: "Activity Log" })).toBeVisible();
  await expect(page.getByText(secondDoorName).first()).toBeVisible();
  await expect(page.getByText("Main Door")).not.toBeVisible();

  // Return to Main Door. Its settings and activity should still be there.
  await selectDoor(page, "Main Door");

  await page.getByRole("button", { name: "Settings" }).click();
  await expect(page.getByRole("heading", { name: "Quick Controls" })).toBeVisible();

  await expect(page.getByText("Lock Delay")).toBeVisible();
  await expect(page.getByRole("button", { name: "Press to Unlock" })).toBeVisible();

  await page.getByRole("button", { name: "Activity" }).click();
  await expect(page.getByRole("heading", { name: "Activity Log" })).toBeVisible();
  await expect(page.getByText("Main Door").first()).toBeVisible();
  await expect(page.getByText(secondDoorName)).not.toBeVisible();

  // Return to Door 2. Its activity should still be separate.
  await selectDoor(page, secondDoorName);

  await page.getByRole("button", { name: "Activity" }).click();
  await expect(page.getByRole("heading", { name: "Activity Log" })).toBeVisible();
  await expect(page.getByText(secondDoorName).first()).toBeVisible();
  await expect(page.getByText("Main Door")).not.toBeVisible();

  // Also confirm Door 2 can have separate lock activity without touching Main Door.
  await lockDoor(page);

  await page.getByRole("button", { name: "Activity" }).click();
  await expect(page.getByRole("heading", { name: "Activity Log" })).toBeVisible();
  await expect(page.getByText(secondDoorName).first()).toBeVisible();
  await expect(page.getByText("Main Door")).not.toBeVisible();
});
