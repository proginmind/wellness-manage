import { expect, test } from "@playwright/test";

const ownerEmail = process.env.E2E_OWNER_EMAIL ?? "owner@example.com";
const ownerPassword = process.env.E2E_OWNER_PASSWORD ?? "password123";

test.describe("clients", () => {
  test("shows client list after login", async ({ page }) => {
    await page.goto("/login");

    await page.getByLabel("Email").fill(ownerEmail);
    await page.getByRole("textbox", { name: "Password" }).fill(ownerPassword);
    await page.getByRole("button", { name: "Sign In" }).click();

    await expect(page).toHaveURL(/\/dashboard/);

    await page.goto("/members");

    await expect(page.getByRole("heading", { name: "Clients" })).toBeVisible();
    await expect(page.getByText("Emma Johnson")).toBeVisible();
    await expect(page.getByText("Liam Smith")).toBeVisible();
    await expect(page.getByRole("link", { name: "Add Client" })).toBeVisible();
  });
});
