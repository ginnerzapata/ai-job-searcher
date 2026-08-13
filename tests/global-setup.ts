import { execFile } from "node:child_process";
import { mkdir, rm } from "node:fs/promises";
import { promisify } from "node:util";
import path from "node:path";

const execFileAsync = promisify(execFile);

export default async function globalSetup() {
  const testDataDirectory = path.resolve(".test-data");
  const databasePath = path.join(testDataDirectory, "job-searcher.db");

  await rm(testDataDirectory, { force: true, recursive: true });
  await mkdir(testDataDirectory, { recursive: true });
  await execFileAsync("pnpm", ["--filter", "@job-searcher/api", "db:migrate"], {
    cwd: path.resolve(),
    env: { ...process.env, DATABASE_URL: databasePath },
  });
}
