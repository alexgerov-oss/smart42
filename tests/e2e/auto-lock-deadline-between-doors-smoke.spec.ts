import { expect, test } from "@playwright/test";
import { loginAsAdmin, openCleanLoginPage } from "./helpers/auth";
import { activateTrial, addDoor, selectDoor, setAutomaticLockToMinimum, unlockDoor } from "./helpers/actions";

test("auto lock deadline keeps counting while switching between doors", async ({ page }) => {
  const secondDoorName = `Deadline Door ${Date.now()}`;

  await openCleanLoginPage(page);
  await loginAsAdmin(page);
  await activateTrial(page);

  await setAutomaticLockToMinimum(page);

  await unlockDoor(page);

  await expect(page.getByText("Automatic lock")).toBeVisible();
  await expect(page.getByText(/5s|4s|3s|2s|1s/)).toBeVisible();

  await page.waitForTimeout(2_000);

  await addDoor(page, secondDoorName);

  await page.waitForTimeout(5_000);

  await selectDoor(page, "Main Door");

  await expect(page.getByText("Automatic lock")).not.toBeVisible();

  await expect(page.getByText("Lock", { exact: true })).toHaveClass(/text-red-500/);
  await expect(page.getByText("Unlock", { exact: true })).not.toHaveClass(/text-green-500/);

  await selectDoor(page, secondDoorName);

  await expect(page.getByText("Automatic lock")).not.toBeVisible();
  await expect(page.getByText("Lock", { exact: true })).toHaveClass(/text-red-500/);
});
