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

async function createIButton(page: Page, name: string) {
  await page.getByRole("button", { name: "Settings" }).click();
  await expect(page.getByRole("heading", { name: "Settings" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "iButton Access" })).toBeVisible();

  await page.getByRole("button", { name: "Add iButton User" }).click();

  await expect(page.getByText("Controller is in listening mode")).toBeVisible();

  await page.getByLabel("Name").fill(name);
  await page.getByRole("button", { name: "Save iButton" }).click();

  await expect(page.getByText(name)).toBeVisible({
    timeout: 15_000,
  });
}

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
