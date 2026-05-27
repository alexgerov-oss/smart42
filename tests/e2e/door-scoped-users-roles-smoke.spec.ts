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

async function createAppUser(page: Page, params: { name: string; email: string; access?: "Full Access" }) {
  await page.getByRole("button", { name: "Settings" }).click();
  await expect(page.getByRole("heading", { name: "Settings" })).toBeVisible();

  await page.getByRole("button", { name: "Add User" }).click();

  await expect(page.getByRole("heading", { name: "Invite New User" })).toBeVisible();

  await page.getByPlaceholder("Enter user name").fill(params.name);
  await page.getByPlaceholder("user@example.com").fill(params.email);

  if (params.access === "Full Access") {
    await page.getByRole("combobox").click();
    await page.getByRole("option", { name: "Full Access" }).click();
  }

  await page.getByRole("button", { name: "Send Invitation" }).click();

  await expect(page.getByText(params.email)).toBeVisible({
    timeout: 15_000,
  });
}

async function logout(page: Page) {
  await page.getByRole("button", { name: "Profile" }).click();
  await expect(page.getByText("Logout")).toBeVisible();
  await page.getByText("Logout").click();

  await expect(page.getByRole("heading", { name: "SmartDoor" })).toBeVisible({
    timeout: 15_000,
  });
}

async function loginWithCredentials(page: Page, email: string, password: string) {
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Login" }).click();

  await expect(page.getByText("SmartDoor Inc.")).toBeVisible({
    timeout: 15_000,
  });
}

async function unlockAndLock(page: Page) {
  const unlockResponsePromise = page.waitForResponse((response) => {
    return (
      response.url().includes("/api/doors/unlock") &&
      response.request().method() === "POST" &&
      response.ok()
    );
  });

  await page.getByText("Unlock", { exact: true }).click();
  await unlockResponsePromise;

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

test("door scoped app users keep role lists separate between doors", async ({ page }) => {
  const secondDoorName = `Role Door ${Date.now()}`;
  const fullAccessEmail = `door-full-${Date.now()}@example.com`;
  const openCloseEmail = `door-open-${Date.now()}@example.com`;
  const appUserPassword = "smart42-temp";

  await openCleanLoginPage(page);
  await loginAsAdmin(page);
  await activateTrial(page);

  // Main Door users.
  await createAppUser(page, {
    name: "Door Scoped Full Access",
    email: fullAccessEmail,
    access: "Full Access",
  });

  await createAppUser(page, {
    name: "Door Scoped Open Close",
    email: openCloseEmail,
  });

  await expect(page.getByText(fullAccessEmail)).toBeVisible();
  await expect(page.getByText(openCloseEmail)).toBeVisible();

  // New door starts with clean App Users list.
  await addDoor(page, secondDoorName);

  await page.getByRole("button", { name: "Settings" }).click();
  await expect(page.getByRole("heading", { name: "Settings" })).toBeVisible();

  await expect(page.getByText(fullAccessEmail)).not.toBeVisible();
  await expect(page.getByText(openCloseEmail)).not.toBeVisible();

  // Main Door restores its own users.
  await selectDoor(page, "Main Door");

  await page.getByRole("button", { name: "Settings" }).click();
  await expect(page.getByRole("heading", { name: "Settings" })).toBeVisible();

  await expect(page.getByText(fullAccessEmail)).toBeVisible();
  await expect(page.getByText(openCloseEmail)).toBeVisible();

  // Full Access user role still works.
  await logout(page);
  await loginWithCredentials(page, fullAccessEmail, appUserPassword);

  await unlockAndLock(page);

  await page.getByRole("button", { name: "Settings" }).click();
  await expect(page.getByRole("heading", { name: "Quick Controls" })).toBeVisible();

  await page.getByRole("button", { name: "Activity" }).click();
  await expect(page.getByRole("heading", { name: "Activity Log" })).toBeVisible();

  await logout(page);

  // Open/Close Only user role still works and cannot access Settings/Activity.
  await loginWithCredentials(page, openCloseEmail, appUserPassword);

  await expect(page.getByRole("button", { name: "Settings" })).toBeDisabled();
  await expect(page.getByRole("button", { name: "Activity" })).toBeDisabled();

  await unlockAndLock(page);
});
