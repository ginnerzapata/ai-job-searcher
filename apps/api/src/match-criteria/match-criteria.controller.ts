import type { Context } from "hono";
import { z } from "zod";
import {
  getMatchCriteria,
  saveMatchCriteria,
} from "./match-criteria.service.js";
import { matchCriteriaSchema } from "./match-criteria.schema.js";

export async function listMatchCriteria(c: Context) {
  const criteria = await getMatchCriteria();

  if (!criteria) {
    return c.json(
      { error: "Create a Job Searcher Profile before saving Match Criteria." },
      400,
    );
  }

  return c.json(criteria);
}

export async function persistMatchCriteria(c: Context) {
  const parsedCriteria = matchCriteriaSchema.safeParse(await c.req.json());

  if (!parsedCriteria.success) {
    return c.json(
      {
        error: "Match Criteria are invalid.",
        details: z.treeifyError(parsedCriteria.error),
      },
      400,
    );
  }

  try {
    const id = await saveMatchCriteria(parsedCriteria.data);

    return c.json(
      { id, ...parsedCriteria.data },
      parsedCriteria.data.id ? 200 : 201,
    );
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "JOB_SEARCHER_PROFILE_NOT_FOUND"
    ) {
      return c.json(
        { error: "Create a Job Searcher Profile before saving Match Criteria." },
        400,
      );
    }

    throw error;
  }
}
