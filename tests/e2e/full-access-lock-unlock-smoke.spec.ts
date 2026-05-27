import { expect, test } from "@playwright/test";
import { loginAsAdmin, openCleanLoginPage } from "./helpers/auth";

test("full access user can unlock and lock", async ({ page }) => {
  const fullAccessEmail = `full-access-${Date.now()}@example.com`;
  const fullAccessPassword = "smart42-temp";

  await openCleanLoginPage(page);

  // Admin first login
  await loginAsAdmin(page);

  // Activate trial so Admin can create App Users
  await page.getByRole("button", { name: "Get Premium" }).click();
  await expect(page.getByRole("heading", { name: "Activity" })).toBeVisible();

  await page.getByRole("button", { name: "Start Free Trial" }).click();

  await expect(page.getByText("SmartDoor Inc.")).toBeVisible({ timeout: 15_000 });

  // Create Full Access user
  await page.getByRole("button", { name: "Settings" }).click();
  await expect(page.getByRole("heading", { name: "Settings" })).toBeVisible();

  await page.getByRole("button", { name: "Add User" }).click();

  await expect(page.getByRole("heading", { name: "Invite New User" })).toBeVisible();

  await page.getByPlaceholder("Enter user name").fill("Full Access Test");
  await page.getByPlaceholder("user@example.com").fill(fullAccessEmail);

  await page.getByRole("combobox").click();
  await page.getByRole("option", { name: "Full Access" }).click();

  await page.getByRole("button", { name: "Send Invitation" }).click();

  await expect(page.getByText(fullAccessEmail)).toBeVisible({ timeout: 15_000 });

  // Logout Admin
  await page.getByRole("button", { name: "Profile" }).click();
  await expect(page.getByText("Logout")).toBeVisible();
  await page.getByText("Logout").click();

  // Login as Full Access user
  await expect(page.getByRole("heading", { name: "SmartDoor" })).toBeVisible({ timeout: 15_000 });

  await page.getByLabel("Email").fill(fullAccessEmail);
  await page.getByLabel("Password").fill(fullAccessPassword);
  await page.getByRole("button", { name: "Login" }).click();

  await expect(page.getByText("SmartDoor Inc.")).toBeVisible({ timeout: 15_000 });

  // Full Access can unlock
  const unlockResponsePromise = page.waitForResponse((response) => {
    return (
      response.url().includes("/api/doors/unlock") &&
      response.request().method() === "POST" &&
      response.ok()
    );
  });

  await page.getByText("Unlock", { exact: true }).click();

  await unlockResponsePromise;

  // Full Access can lock
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
