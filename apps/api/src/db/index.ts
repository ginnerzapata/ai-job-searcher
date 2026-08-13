import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import * as schema from "./schema.js";

const sqlite = new Database("data/job-searcher.db");
export const db = drizzle({ client: sqlite, schema });
