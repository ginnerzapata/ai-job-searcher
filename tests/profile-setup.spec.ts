import { expect, test } from "@playwright/test";

test("uploads, derives, edits, and saves a Job Searcher Profile", async ({
  page,
}) => {
  await page.goto("/");

  await page.getByLabel("Upload your CV").setInputFiles({
    name: "cv.md",
    mimeType: "text/markdown",
    buffer: Buffer.from("# Test Job Searcher\n\nFrontend engineer"),
  });
  await page.getByRole("button", { name: "Use this CV" }).click();

  await page.getByRole("button", { name: "Use local CV" }).click();
  await expect(page.getByLabel("Full name")).toHaveValue("Test Job Searcher");

  await page.getByLabel("Full name").fill("Edited Job Searcher");
  await page.getByRole("button", { name: "Save profile" }).click();

  await expect(page.getByText("Profile saved.")).toBeVisible();

  await page.getByLabel("Criteria name").fill("Frontend roles");
  await page.getByLabel("Target titles").fill("Frontend Engineer");
  await page.getByLabel("Use as the default for the next Search Run").check();
  await page.getByRole("button", { name: "Save Match Criteria" }).click();

  await expect(
    page.getByRole("button", { name: "Frontend roles (default)" }),
  ).toBeVisible();

  const criteriaResponse = await page.request.get("/api/match-criteria");
  await expect(criteriaResponse).toBeOK();
  await expect(criteriaResponse.json()).resolves.toMatchObject([
    {
      name: "Frontend roles",
      isDefault: true,
      targetTitles: ["Frontend Engineer"],
    },
  ]);
});
