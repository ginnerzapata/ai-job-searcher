import { openai } from "@ai-sdk/openai";
import { generateText, Output } from "ai";
import {
  jobSearcherProfileSchema,
  type JobSearcherProfile,
} from "./profile.schema.js";

export type ProfileDeriver = {
  derive(cvText: string): Promise<JobSearcherProfile>;
};

export const openAiProfileDeriver: ProfileDeriver = {
  async derive(cvText) {
    const { output } = await generateText({
      model: openai("gpt-4.1-mini"),
      output: Output.object({ schema: jobSearcherProfileSchema }),
      prompt: `Derive a factual professional profile from this CV.
Do not invent qualifications. Use empty arrays where the CV provides no relevant information.

CV:
${cvText}`,
    });

    return output;
  },
};

export const testProfileDeriver: ProfileDeriver = {
  async derive() {
    return {
      fullName: "Test Job Searcher",
      headline: "Frontend Engineer",
      summary: "A controlled profile derived during browser tests.",
      skills: ["React", "TypeScript"],
      experience: ["Frontend Engineer at Example"],
      education: ["BSc Computer Science"],
    };
  },
};
