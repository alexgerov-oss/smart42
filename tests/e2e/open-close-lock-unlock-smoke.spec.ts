import { expect, test } from "@playwright/test";
import { loginAsAdmin, openCleanLoginPage } from "./helpers/auth";

test("open close only user can unlock and lock but cannot access settings or activity", async ({ page }) => {
  const openCloseEmail = `open-close-${Date.now()}@example.com`;
  const openClosePassword = "smart42-temp";

  await openCleanLoginPage(page);

  // Admin first login
  await loginAsAdmin(page);

  // Activate trial so Admin can create App Users
  await page.getByRole("button", { name: "Get Premium" }).click();
  await expect(page.getByRole("heading", { name: "Activity" })).toBeVisible();

  await page.getByRole("button", { name: "Start Free Trial" }).click();

  await expect(page.getByText("SmartDoor Inc.")).toBeVisible({ timeout: 15_000 });

  // Create Open/Close Only user
  await page.getByRole("button", { name: "Settings" }).click();
  await expect(page.getByRole("heading", { name: "Settings" })).toBeVisible();

  await page.getByRole("button", { name: "Add User" }).click();

  await expect(page.getByRole("heading", { name: "Invite New User" })).toBeVisible();

  await page.getByPlaceholder("Enter user name").fill("Open Close Test");
  await page.getByPlaceholder("user@example.com").fill(openCloseEmail);

  // Default access is Open/Close Only, so no dropdown change is needed.

  await page.getByRole("button", { name: "Send Invitation" }).click();

  await expect(page.getByText(openCloseEmail)).toBeVisible({ timeout: 15_000 });

  // Logout Admin
  await page.getByRole("button", { name: "Profile" }).click();
  await expect(page.getByText("Logout")).toBeVisible();
  await page.getByText("Logout").click();

  // Login as Open/Close Only user
  await expect(page.getByRole("heading", { name: "SmartDoor" })).toBeVisible({ timeout: 15_000 });

  await page.getByLabel("Email").fill(openCloseEmail);
  await page.getByLabel("Password").fill(openClosePassword);
  await page.getByRole("button", { name: "Login" }).click();

  await expect(page.getByText("SmartDoor Inc.")).toBeVisible({ timeout: 15_000 });

  // Open/Close Only cannot access Settings or Activity.
  await expect(page.getByRole("button", { name: "Settings" })).toBeDisabled();
  await expect(page.getByRole("button", { name: "Activity" })).toBeDisabled();

  // Open/Close Only can unlock.
  const unlockResponsePromise = page.waitForResponse((response) => {
    return (
      response.url().includes("/api/doors/unlock") &&
      response.request().method() === "POST" &&
      response.ok()
    );
  });

  await page.getByText("Unlock", { exact: true }).click();

  await unlockResponsePromise;

  // Open/Close Only can lock.
  const lockResponsePromise = page.waitForResponse((response) => {
    return (
      response.url().includes("/api/doors/lock") &&
      response.request().method() === "POST" &&
      response.ok()
    );
  });

  await page.getByText("Lock", { exact: true }).click();

  await lockResponsePromise;
});
