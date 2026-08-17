import { z } from "zod";
export const remotePolicySchema = z.enum([
  "remote",
  "hybrid",
  "on_site",
  "any",
]);

export const senioritySchema = z.enum([
  "intern",
  "entry",
  "mid",
  "senior",
  "lead",
  "staff",
  "principal",
  "manager",
  "director",
  "executive",
  "any",
]);

export const employmentTypeSchema = z.enum([
  "full_time",
  "part_time",
  "contract",
  "temporary",
  "internship",
  "any",
]);

export const fitGradeSchema = z.enum(["S", "A", "B", "C", "D"]);

export const matchCriteriaSchema = z
  .object({
    id: z.number().int().positive().optional(),
    name: z.string().trim().min(1).max(80),
    isDefault: z.boolean(),
    targetTitles: z.array(z.string().trim().min(1)),
    locations: z.array(z.string().trim().min(1)),
    remotePolicy: remotePolicySchema,
    seniorities: z.array(senioritySchema),
    employmentTypes: z.array(employmentTypeSchema),
    excludedKeywords: z.array(z.string().trim().min(1)),
    minimumCompensation: z.number().int().positive().nullable(),
    compensationCurrency: z.string().length(3).toUpperCase().nullable(),
    minimumFitGrade: fitGradeSchema,
  })
  .superRefine((criteria, context) => {
    const hasCompensation = criteria.minimumCompensation !== null;
    const hasCurrency = criteria.compensationCurrency !== null;
    if (hasCompensation !== hasCurrency) {
      context.addIssue({
        code: "custom",
        message:
          "Compensation amount and currency must either both be provided or both be empty.",
        path: ["minimumCompensation"],
      });
    }
  });

export type MatchCriteria = z.infer<typeof matchCriteriaSchema>;
