import dotenv from "dotenv";
import { serve } from "@hono/node-server";
import { Hono } from "hono";
import path from "node:path";
import { matchCriteriaRoutes } from "./match-criteria/match-criteria.routes.js";
import { profileRoutes } from "./profile/profile.routes.js";

dotenv.config({
  path: path.resolve(import.meta.dirname, "../../../.env"),
});

const app = new Hono();

app.get("/api/health", (c) => c.json({ ok: true }));
app.route("/api/match-criteria", matchCriteriaRoutes);
app.route("/api/profile", profileRoutes);

serve({
  fetch: app.fetch,
  port: 3001,
});
