import dotenv from "dotenv";
import { serve } from "@hono/node-server";
import { Hono } from "hono";
import path from "node:path";
import { constants } from "node:fs";
import { access, mkdir, writeFile, readFile } from "node:fs/promises";
import { PDFParse } from "pdf-parse";
import { generateText, Output } from "ai";
import { openai } from "@ai-sdk/openai";
import { jobSearcherProfileSchema } from "./profile-schema.js";
import { eq } from "drizzle-orm";
import { db } from "./db/index.js";
import { z } from "zod";
import { jobSearcherProfiles } from "./db/schema.js";

dotenv.config({
  path: path.resolve(import.meta.dirname, "../../../.env"),
});

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
app.post("/api/profile/derive", async (c) => {
  const cvPath = path.resolve(process.cwd(), "../../CV.md");
  try {
    await access(cvPath, constants.R_OK);
  } catch {
    return c.json(
      { error: "Upload or provide a CV before deriving a profile" },
      400,
    );
  }
  if (!process.env.OPENAI_API_KEY) {
    return c.json({ error: "OPENAI_API_KEY is not configured" }, 500);
  }
  const cvText = await readFile(cvPath, "utf8");
  const { output: profile } = await generateText({
    model: openai("gpt-4.1-mini"),
    output: Output.object({
      schema: jobSearcherProfileSchema,
    }),
    prompt: `Derive a factual professional profile from this CV.
Do not invent qualifications. Use empty arrays where the CV provides no relevant information.

CV:
${cvText}`,
  });
  return c.json(profile);
});

app.put("/api/profile", async (c) => {
  const parsedProfile = jobSearcherProfileSchema.safeParse(await c.req.json());
  if (!parsedProfile.success) {
    return c.json(
      {
        error: "Profile data is invalid",
        details: z.treeifyError(parsedProfile.error),
      },
      400,
    );
  }
  const profile = parsedProfile.data;
  const now = new Date();
  const existingProfile = await db.query.jobSearcherProfiles.findFirst();

  if (existingProfile) {
    await db
      .update(jobSearcherProfiles)
      .set({
        ...profile,
        updatedAt: now,
      })
      .where(eq(jobSearcherProfiles.id, existingProfile.id));
    return c.json({ id: existingProfile.id, ...profile, updatedAt: now });
  }

  const [createProfile] = await db
    .insert(jobSearcherProfiles)
    .values({
      ...profile,
      createdAt: now,
      updatedAt: now,
    })
    .returning();

  return c.json(createProfile, 201);
});

serve({
  fetch: app.fetch,
  port: 3001,
});
