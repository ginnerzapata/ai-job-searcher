import { Hono } from "hono";
import {
  listMatchCriteria,
  persistMatchCriteria,
} from "./match-criteria.controller.js";

export const matchCriteriaRoutes = new Hono();

matchCriteriaRoutes.get("/", listMatchCriteria);
matchCriteriaRoutes.post("/", persistMatchCriteria);
