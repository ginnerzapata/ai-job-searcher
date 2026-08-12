import { expect, test } from "@playwright/test";

test("Shows a healthy API response through the development proxy", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.getByText("API status: Healthy")).toBeVisible();
});
