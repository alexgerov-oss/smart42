import { expect, test, type Page } from "@playwright/test";
import { loginAsAdmin, openCleanLoginPage } from "./helpers/auth";

async function activateTrial(page: Page) {
  await page.getByRole("button", { name: "Get Premium" }).click();
  await expect(page.getByRole("heading", { name: "Activity" })).toBeVisible();

  await page.getByRole("button", { name: "Start Free Trial" }).click();

  await expect(page.getByText("SmartDoor Inc.")).toBeVisible({
    timeout: 15_000,
  });
}

async function addDoor(page: Page, name: string) {
  await page.getByRole("button", { name: "Home" }).click();
  await expect(page.getByText("SmartDoor Inc.")).toBeVisible({
    timeout: 15_000,
  });

  await page.locator("button:has(svg.lucide-plus)").click();

  await expect(page.getByRole("heading", { name: "Add Door" })).toBeVisible();

  await page.getByLabel("Door Name").fill(name);
  await page.getByRole("button", { name: "Save" }).click();

  await expect(page.getByRole("combobox").filter({ hasText: name })).toBeVisible({
    timeout: 15_000,
  });
}

async function selectDoor(page: Page, name: string) {
  await page.getByRole("button", { name: "Home" }).click();
  await expect(page.getByText("SmartDoor Inc.")).toBeVisible({
    timeout: 15_000,
  });

  await page.getByRole("combobox").click();
  await page.getByRole("option", { name }).click();

  await expect(page.getByRole("combobox").filter({ hasText: name })).toBeVisible({
    timeout: 15_000,
  });
}

async function createScene(page: Page, sceneName: string) {
  await page.getByRole("button", { name: "Scenes" }).click();
  await expect(page.getByRole("heading", { name: "Scenes" })).toBeVisible();

  await page.getByRole("button", { name: "Add Scene" }).click();

  await expect(page.getByText("New Scene")).toBeVisible();

  await page.getByPlaceholder("Enter scene name").fill(sceneName);
  await page.getByRole("button", { name: "Create Scene" }).click();

  await expect(page.getByText(sceneName)).toBeVisible({
    timeout: 15_000,
  });
}

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
