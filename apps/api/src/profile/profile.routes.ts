import { Hono } from "hono";
import {
  deriveJobSearcherProfile,
  getCvAvailability,
  persistJobSearcherProfile,
  uploadCv,
} from "./profile.controller.js";

export const profileRoutes = new Hono();

profileRoutes.get("/cv", getCvAvailability);
profileRoutes.post("/cv", uploadCv);
profileRoutes.post("/derive", deriveJobSearcherProfile);
profileRoutes.put("/", persistJobSearcherProfile);
