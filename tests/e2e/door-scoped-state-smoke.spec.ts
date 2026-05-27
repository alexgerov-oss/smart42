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

async function setAutomaticLockToMinimum(page: Page) {
  await page.getByRole("button", { name: "Settings" }).click();
  await expect(page.getByRole("heading", { name: "Quick Controls" })).toBeVisible();

  await page.getByLabel("Automatic Lock").click();

  await expect(page.getByText("Lock Delay")).toBeVisible();

  const slider = page.getByRole("slider");
  await slider.focus();
  await page.keyboard.press("Home");

  await expect(page.getByText("5s")).toBeVisible();
}

async function lockQuickControls(page: Page) {
  await page.getByRole("button", { name: "Settings" }).click();
  await expect(page.getByRole("heading", { name: "Quick Controls" })).toBeVisible();

  await page.getByRole("button", { name: "Press to Lock" }).click();

  await expect(page.getByRole("button", { name: "Press to Unlock" })).toBeVisible();
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

async function lockDoor(page: Page) {
  await page.getByRole("button", { name: "Home" }).click();
  await expect(page.getByText("SmartDoor Inc.")).toBeVisible({
    timeout: 15_000,
  });

  const lockResponsePromise = page.waitForResponse((response) => {
    return (
      response.url().includes("/api/doors/lock") &&
      response.request().method() === "POST" &&
      response.ok()
    );
  });

  await page.getByText("Lock", { exact: true }).click();

  await lockResponsePromise;
}

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
