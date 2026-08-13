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
