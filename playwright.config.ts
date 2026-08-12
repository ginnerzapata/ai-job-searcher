import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  use: {
    baseURL: "http://localhost:5173",
    ...devices["Desktop Chrome"],
  },
  webServer: [
    {
      command: "pnpm --filter @job-searcher/api run dev",
      port: 3001,
      reuseExistingServer: !process.env.CI,
    },
    {
      command: "pnpm --filter web run dev",
      port: 5173,
      reuseExistingServer: !process.env.CI,
    },
  ],
});
