import { expect, test, type Page } from "@playwright/test";
import { loginAsAdmin, openCleanLoginPage } from "./helpers/auth";

async function activateTrial(page: Page) {
  const startFreeTrialButton = page.getByRole("button", { name: "Start Free Trial" });

  const startFreeTrialVisible = await startFreeTrialButton
    .isVisible({ timeout: 1_000 })
    .catch(() => false);

  if (!startFreeTrialVisible) {
    await page.getByRole("button", { name: "Get Premium" }).click();
    await expect(page.getByRole("heading", { name: "Activity" })).toBeVisible({
      timeout: 15_000,
    });
  }

  await startFreeTrialButton.click();

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

async function createAppUser(page: Page, params: { name: string; email: string }) {
  await page.getByRole("button", { name: "Settings" }).click();
  await expect(page.getByRole("heading", { name: "Settings" })).toBeVisible();

  await page.getByRole("button", { name: "Add User" }).click();
  await expect(page.getByRole("heading", { name: "Invite New User" })).toBeVisible();

  await page.getByPlaceholder("Enter user name").fill(params.name);
  await page.getByPlaceholder("user@example.com").fill(params.email);

  await page.getByRole("button", { name: "Send Invitation" }).click();

  await expect(page.getByText(params.email)).toBeVisible({
    timeout: 15_000,
  });
}

async function enableAutomaticLock(page: Page) {
  await page.getByRole("button", { name: "Settings" }).click();
  await expect(page.getByRole("heading", { name: "Quick Controls" })).toBeVisible();

  await page.getByLabel("Automatic Lock").click();

  await expect(page.getByText("Lock Delay")).toBeVisible();

  const slider = page.getByRole("slider");
  await slider.focus();
  await page.keyboard.press("Home");

  await expect(page.getByText("5s")).toBeVisible();
}

async function unlockDoor(page: Page) {
  await page.getByRole("button", { name: "Home" }).click();
  await expect(page.getByText("SmartDoor Inc.")).toBeVisible({
    timeout: 15_000,
  });

  const unlockResponsePromise = page.waitForResponse((response) => {
    return (
      response.url().includes("/api/doors/unlock") &&
      response.request().method() === "POST" &&
      response.ok()
    );
  });

  await page.getByText("Unlock", { exact: true }).click();

  await unlockResponsePromise;
}

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
  await enableAutomaticLock(page);
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
