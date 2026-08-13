import { defineConfig, devices } from "@playwright/test";
import path from "node:path";

const testDataDirectory = path.resolve(".test-data");

export default defineConfig({
  testDir: "./tests",
  use: {
    baseURL: "http://localhost:5173",
    ...devices["Desktop Chrome"],
  },
  webServer: [
    {
      command:
        "pnpm --filter @job-searcher/api exec tsx ../../tests/prepare.ts && pnpm --filter @job-searcher/api run dev",
      port: 3001,
      reuseExistingServer: false,
      env: {
        ...process.env,
        CV_PATH: path.join(testDataDirectory, "CV.md"),
        DATABASE_URL: path.join(testDataDirectory, "job-searcher.db"),
        PROFILE_DERIVER: "test",
      },
    },
    {
      command: "pnpm --filter web run dev",
      port: 5173,
      reuseExistingServer: !process.env.CI,
    },
  ],
});
