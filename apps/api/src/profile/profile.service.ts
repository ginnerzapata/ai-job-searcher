import { eq } from "drizzle-orm";
import { db } from "../db/index.js";
import { jobSearcherProfiles } from "../db/schema.js";
import {
  openAiProfileDeriver,
  testProfileDeriver,
  type ProfileDeriver,
} from "./profile-deriver.js";
import type { JobSearcherProfile } from "./profile.schema.js";

const defaultProfileDeriver =
  process.env.PROFILE_DERIVER === "test"
    ? testProfileDeriver
    : openAiProfileDeriver;

export async function deriveProfile(
  cvText: string,
  deriver: ProfileDeriver = defaultProfileDeriver,
) {
  return deriver.derive(cvText);
}

export async function saveProfile(profile: JobSearcherProfile) {
  const now = new Date();
  const existingProfile = await db.query.jobSearcherProfiles.findFirst();

  if (existingProfile) {
    await db
      .update(jobSearcherProfiles)
      .set({ ...profile, updatedAt: now })
      .where(eq(jobSearcherProfiles.id, existingProfile.id));

    return { id: existingProfile.id, ...profile, updatedAt: now };
  }

  const [createdProfile] = await db
    .insert(jobSearcherProfiles)
    .values({ ...profile, createdAt: now, updatedAt: now })
    .returning();

  return createdProfile;
}
