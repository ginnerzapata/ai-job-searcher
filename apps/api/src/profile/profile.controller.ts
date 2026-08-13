import type { Context } from "hono";
import { z } from "zod";
import { cvExists, readCv, saveCv } from "./cv.service.js";
import { deriveProfile, saveProfile } from "./profile.service.js";
import { jobSearcherProfileSchema } from "./profile.schema.js";

export async function getCvAvailability(c: Context) {
  return c.json({ exists: await cvExists() });
}

export async function uploadCv(c: Context) {
  const file = (await c.req.parseBody()).file;

  if (!(file instanceof File)) {
    return c.json({ error: "A CV file is required." }, 400);
  }

  try {
    await saveCv(file);
    return c.json({ exists: true }, 201);
  } catch (error) {
    if (error instanceof Error && error.message === "UNSUPPORTED_CV_FILE") {
      return c.json({ error: "Upload a Markdown or PDF CV." }, 400);
    }

    if (error instanceof Error && error.message === "EMPTY_CV_TEXT") {
      return c.json({ error: "No readable text was found in this CV." }, 422);
    }

    throw error;
  }
}

export async function deriveJobSearcherProfile(c: Context) {
  if (!(await cvExists())) {
    return c.json(
      { error: "Upload or provide a CV before deriving a profile." },
      400,
    );
  }

  if (!process.env.OPENAI_API_KEY) {
    return c.json({ error: "OPENAI_API_KEY is not configured." }, 500);
  }

  return c.json(await deriveProfile(await readCv()));
}

export async function persistJobSearcherProfile(c: Context) {
  const parsedProfile = jobSearcherProfileSchema.safeParse(await c.req.json());

  if (!parsedProfile.success) {
    return c.json(
      {
        error: "Profile data is invalid.",
        details: z.treeifyError(parsedProfile.error),
      },
      400,
    );
  }

  return c.json(await saveProfile(parsedProfile.data));
}
