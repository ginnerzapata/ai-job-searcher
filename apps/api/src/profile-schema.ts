import { z } from "zod";

export const jobSearcherProfileSchema = z.object({
  fullName: z.string().describe("The Job Searcher's full name."),
  headline: z.string().describe("A concise professional headline."),
  summary: z.string().describe("A concise professional summary."),
  skills: z.array(z.string()).describe("Relevant professional skills."),
  experience: z
    .array(z.string())
    .describe("Concise descriptions of relevant work experience."),
  education: z
    .array(z.string())
    .describe("Concise descriptions of education and certifications."),
});
export type JobSearcherProfile = z.infer<typeof jobSearcherProfileSchema>;
