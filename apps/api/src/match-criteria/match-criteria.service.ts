import { and, eq } from "drizzle-orm";
import { db } from "../db/index.js";
import { jobSearcherProfiles, matchCriteria } from "../db/schema.js";
import type { MatchCriteria } from "./match-criteria.schema.js";

async function getJobSearcherProfile() {
  return db.query.jobSearcherProfiles.findFirst();
}

export async function getMatchCriteria() {
  const profile = await getJobSearcherProfile();

  if (!profile) {
    return null;
  }

  return db.query.matchCriteria.findMany({
    where: eq(matchCriteria.jobSearcherProfileId, profile.id),
  });
}

export async function saveMatchCriteria(criteria: MatchCriteria) {
  const profile = await getJobSearcherProfile();

  if (!profile) {
    throw new Error("JOB_SEARCHER_PROFILE_NOT_FOUND");
  }

  return db.transaction((tx) => {
    const now = new Date();

    if (criteria.isDefault) {
      tx
        .update(matchCriteria)
        .set({ isDefault: false, updatedAt: now })
        .where(eq(matchCriteria.jobSearcherProfileId, profile.id))
        .run();
    }

    if (criteria.id) {
      tx
        .update(matchCriteria)
        .set({
          ...criteria,
          updatedAt: now,
        })
        .where(
          and(
            eq(matchCriteria.id, criteria.id),
            eq(matchCriteria.jobSearcherProfileId, profile.id),
          ),
        )
        .run();

      return criteria.id;
    }

    const createdCriteria = tx
      .insert(matchCriteria)
      .values({
        ...criteria,
        jobSearcherProfileId: profile.id,
        createdAt: now,
        updatedAt: now,
      })
      .returning({ id: matchCriteria.id })
      .get();

    return createdCriteria.id;
  });
}
