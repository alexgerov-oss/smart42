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
