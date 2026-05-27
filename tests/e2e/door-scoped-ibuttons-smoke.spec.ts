import { expect, test } from "@playwright/test";
import { loginAsAdmin, openCleanLoginPage } from "./helpers/auth";
import { activateTrial, addDoor, createIButton, selectDoor } from "./helpers/actions";

test("door scoped iButtons stay separate between doors", async ({ page }) => {
  const secondDoorName = `iButton Door ${Date.now()}`;
  const mainDoorIButtonName = `Main iButton ${Date.now()}`;
  const secondDoorIButtonName = `Second iButton ${Date.now()}`;

  await openCleanLoginPage(page);
  await loginAsAdmin(page);
  await activateTrial(page);

  // Main Door gets its own iButton.
  await createIButton(page, mainDoorIButtonName);

  // Add Door 2. Main Door iButton should not appear there.
  await addDoor(page, secondDoorName);

  await page.getByRole("button", { name: "Settings" }).click();
  await expect(page.getByRole("heading", { name: "Settings" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "iButton Access" })).toBeVisible();

  await expect(page.getByText(mainDoorIButtonName)).not.toBeVisible();

  // Door 2 gets its own iButton.
  await createIButton(page, secondDoorIButtonName);

  await expect(page.getByText(secondDoorIButtonName)).toBeVisible();
  await expect(page.getByText(mainDoorIButtonName)).not.toBeVisible();

  // Returning to Main Door restores only Main Door iButton.
  await selectDoor(page, "Main Door");

  await page.getByRole("button", { name: "Settings" }).click();
  await expect(page.getByRole("heading", { name: "Settings" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "iButton Access" })).toBeVisible();

  await expect(page.getByText(mainDoorIButtonName)).toBeVisible();
  await expect(page.getByText(secondDoorIButtonName)).not.toBeVisible();

  // Returning to Door 2 restores only Door 2 iButton.
  await selectDoor(page, secondDoorName);

  await page.getByRole("button", { name: "Settings" }).click();
  await expect(page.getByRole("heading", { name: "Settings" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "iButton Access" })).toBeVisible();

  await expect(page.getByText(secondDoorIButtonName)).toBeVisible();
  await expect(page.getByText(mainDoorIButtonName)).not.toBeVisible();
});
