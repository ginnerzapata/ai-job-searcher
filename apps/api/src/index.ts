import "dotenv";
import { serve } from "@hono/node-server";
import { Hono } from "hono";
import path from "node:path";
import { constants } from "node:fs";
import { access, mkdir, writeFile } from "node:fs/promises";
import { PDFParse } from "pdf-parse";

const app = new Hono();

app.get("/api/health", (c) => c.json({ ok: true }));

app.get("/api/profile/cv", async (c) => {
  const cvPath = path.resolve(process.cwd(), "../../CV.md");

  try {
    await access(cvPath, constants.R_OK);
    return c.json({ exists: true });
  } catch {
    return c.json({ exists: false });
  }
});

app.post("/api/profile/cv", async (c) => {
  const body = await c.req.parseBody();
  const file = body.file;

  let cvText: string;

  if (!(file instanceof File)) {
    return c.json({ error: "A CV file is required" }, 400);
  }
  if (file.type === "text/markdown") {
    cvText = await file.text();
  } else if (file.type === "application/pdf") {
    const parser = new PDFParse({ data: await file.arrayBuffer() });
    try {
      const result = await parser.getText();
      cvText = result.text;
    } finally {
      parser.destroy();
    }
  } else {
    return c.json({ error: "Upload a Markdown or PDF CV" });
  }
  if (!cvText.trim()) {
    return c.json({ error: "No readable text was found in this CV" }, 422);
  }
  const cvPath = path.resolve(process.cwd(), "../../CV.md");
  await mkdir(path.dirname(cvPath), { recursive: true });
  await writeFile(cvPath, cvText, "utf8");

  return c.json({ exists: true });
});

serve({
  fetch: app.fetch,
  port: 3001,
});
