import "dotenv";
import { serve } from "@hono/node-server";
import { Hono } from "hono";
import path from "node:path";
import { mkdir, writeFile } from "node:fs/promises";

const app = new Hono();

app.get("/api/health", (c) => c.json({ ok: true }));
app.post("/api/profile/cv", async (c) => {
  const body = await c.req.parseBody();
  const file = body.file;

  if (!(file instanceof File)) {
    return c.json({ error: "A CV file is required" }, 400);
  }
  if (file.type !== "text/markdown") {
    return c.json({ error: "Only Markdown CVs are supported yet" }, 400);
  }

  const cvPath = path.resolve(process.cwd(), "../../CV.md");
  await mkdir(path.dirname(cvPath), { recursive: true });
  await writeFile(cvPath, await file.text(), "utf8");

  return c.json({ exists: true });
});

serve({
  fetch: app.fetch,
  port: 3001,
});
