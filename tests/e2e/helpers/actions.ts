import { expect, type Page } from "@playwright/test";

export async function activateTrial(page: Page) {
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

export async function addDoor(page: Page, name: string) {
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

export async function selectDoor(page: Page, name: string) {
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

export async function setAutomaticLockToMinimum(page: Page) {
  await page.getByRole("button", { name: "Settings" }).click();
  await expect(page.getByRole("heading", { name: "Quick Controls" })).toBeVisible();

  await page.getByLabel("Automatic Lock").click();

  await expect(page.getByText("Lock Delay")).toBeVisible();

  const slider = page.getByRole("slider");
  await slider.focus();
  await page.keyboard.press("Home");

  await expect(page.getByText("5s")).toBeVisible();
}

export async function lockQuickControls(page: Page) {
  await page.getByRole("button", { name: "Settings" }).click();
  await expect(page.getByRole("heading", { name: "Quick Controls" })).toBeVisible();

  await page.getByRole("button", { name: "Press to Lock" }).click();

  await expect(page.getByRole("button", { name: "Press to Unlock" })).toBeVisible();
}

export async function createScene(page: Page, sceneName: string) {
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

export async function createIButton(page: Page, name: string) {
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

export async function createAppUser(
  page: Page,
  params: { name: string; email: string; access?: "Full Access" },
) {
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

export async function logout(page: Page) {
  await page.getByRole("button", { name: "Profile" }).click();
  await expect(page.getByText("Logout")).toBeVisible();
  await page.getByText("Logout").click();

  await expect(page.getByRole("heading", { name: "SmartDoor" })).toBeVisible({
    timeout: 15_000,
  });
}

export async function loginWithCredentials(page: Page, email: string, password: string) {
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Login" }).click();

  await expect(page.getByText("SmartDoor Inc.")).toBeVisible({
    timeout: 15_000,
  });
}

export async function unlockDoor(page: Page) {
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

export async function lockDoor(page: Page) {
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

export async function unlockAndLock(page: Page) {
  await unlockDoor(page);
  await lockDoor(page);
}
