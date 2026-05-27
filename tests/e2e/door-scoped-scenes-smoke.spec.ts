import { expect, test } from "@playwright/test";
import { loginAsAdmin, openCleanLoginPage } from "./helpers/auth";
import { activateTrial, addDoor, createScene, selectDoor } from "./helpers/actions";

test("door scoped scenes stay separate between doors", async ({ page }) => {
  const secondDoorName = `Scene Door ${Date.now()}`;
  const mainDoorSceneName = `Main Door Scene ${Date.now()}`;
  const secondDoorSceneName = `Second Door Scene ${Date.now()}`;

  await openCleanLoginPage(page);
  await loginAsAdmin(page);
  await activateTrial(page);

  // Main Door gets its own scene.
  await createScene(page, mainDoorSceneName);

  // Add Door 2. Main Door scene should not appear there.
  await addDoor(page, secondDoorName);

  await page.getByRole("button", { name: "Scenes" }).click();
  await expect(page.getByRole("heading", { name: "Scenes" })).toBeVisible();

  await expect(page.getByText(mainDoorSceneName)).not.toBeVisible();

  // Door 2 gets its own scene.
  await createScene(page, secondDoorSceneName);

  await expect(page.getByText(secondDoorSceneName)).toBeVisible();
  await expect(page.getByText(mainDoorSceneName)).not.toBeVisible();

  // Returning to Main Door restores only Main Door scene.
  await selectDoor(page, "Main Door");

  await page.getByRole("button", { name: "Scenes" }).click();
  await expect(page.getByRole("heading", { name: "Scenes" })).toBeVisible();

  await expect(page.getByText(mainDoorSceneName)).toBeVisible();
  await expect(page.getByText(secondDoorSceneName)).not.toBeVisible();

  // Returning to Door 2 restores only Door 2 scene.
  await selectDoor(page, secondDoorName);

  await page.getByRole("button", { name: "Scenes" }).click();
  await expect(page.getByRole("heading", { name: "Scenes" })).toBeVisible();

  await expect(page.getByText(secondDoorSceneName)).toBeVisible();
  await expect(page.getByText(mainDoorSceneName)).not.toBeVisible();
});
