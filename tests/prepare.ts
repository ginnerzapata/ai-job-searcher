import path from "node:path";
import globalSetup from "./global-setup.js";

process.chdir(path.resolve(import.meta.dirname, ".."));

await globalSetup();
