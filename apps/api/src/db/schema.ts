import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const jobSearcherProfiles = sqliteTable("job_searcher_profiles", {
  id: integer().primaryKey(),
  fullName: text("full_name").notNull(),
  headline: text().notNull(),
  summary: text().notNull(),
  skills: text({ mode: "json" }).$type<string[]>().notNull(),
  experience: text({ mode: "json" }).$type<string[]>().notNull(),
  education: text({ mode: "json" }).$type<string[]>().notNull(),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull(),
});

export const matchCriteria = sqliteTable("match_criteria", {
  id: integer().primaryKey(),
  jobSearcherProfileId: integer("job_searcher_profile_id")
    .notNull()
    .references(() => jobSearcherProfiles.id, { onDelete: "cascade" }),
  name: text().notNull(),
  isDefault: integer("is_default", { mode: "boolean" }).notNull(),
  targetTitles: text("target_titles", { mode: "json" })
    .$type<string[]>()
    .notNull(),
  locations: text({ mode: "json" }).$type<string[]>().notNull(),
  remotePolicy: text("remote_policy").notNull(),
  seniorities: text({ mode: "json" }).$type<string[]>().notNull(),
  employmentTypes: text("employment_types", { mode: "json" })
    .$type<string[]>()
    .notNull(),
  excludedKeywords: text("excluded_keywords", { mode: "json" })
    .$type<string[]>()
    .notNull(),
  minimumCompensation: integer("minimum_compensation"),
  compensationCurrency: text("compensation_currency"),
  minimumFitGrade: text("minimum_fit_grade").notNull(),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull(),
});
