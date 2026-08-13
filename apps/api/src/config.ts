import path from "node:path";

const repositoryRoot = path.resolve(import.meta.dirname, "../../..");

export const config = {
  cvPath: process.env.CV_PATH ?? path.join(repositoryRoot, "CV.md"),
  databasePath:
    process.env.DATABASE_URL ??
    path.join(import.meta.dirname, "../data/job-searcher.db"),
};
