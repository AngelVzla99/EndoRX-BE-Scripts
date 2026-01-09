import { z } from "zod";


export enum SymptomEnum {
    PAINFUL_PERIODS = "painful_periods",
    PELVIC_PAIN = "pelvic_pain",
    PAIN_DURING_OR_AFTER_INTERCOURSE = "pain_during_or_after_intercourse",
    PAIN_WITH_BOWEL_MOVEMENTS_OR_URINATION = "pain_with_bowel_movements_or_urination",
    MENORRHAGIA = "menorrhagia",
    BLOATING = "bloating",
    NAUSEA = "nausea",
    INFERTILITY = "infertility",
    FATIGUE = "fatigue",
    MOOD_CHANGES = "mood_changes",
    BACK_PAIN = "back_pain",
}


export const SymptomEnumSchema = z.enum([
    SymptomEnum.PAINFUL_PERIODS,
    SymptomEnum.PELVIC_PAIN,
    SymptomEnum.PAIN_DURING_OR_AFTER_INTERCOURSE,
    SymptomEnum.PAIN_WITH_BOWEL_MOVEMENTS_OR_URINATION,
    SymptomEnum.MENORRHAGIA,
    SymptomEnum.BLOATING,
    SymptomEnum.NAUSEA,
    SymptomEnum.INFERTILITY,
    SymptomEnum.FATIGUE,
    SymptomEnum.MOOD_CHANGES,
    SymptomEnum.BACK_PAIN,
] as [string, ...string[]]);



export const SymptomRelevanceSchema = z.object({
    type: SymptomEnumSchema,
    relevance: z.number().min(1).max(5),
});

export const PlanPrimitiveSchema = z.object({
    id: z.string(),
    shortDescription: z.string(),
    domain: z.string(),
    clinicalDescription: z.string(),
    frequencyPerWeek: z.number(),
    timeBurdenMinutesPerDay: z.number(),
    mechanismTags: z.array(z.string()).optional(),
    contraindicationTags: z.array(z.string()).optional(),
    relevantSymptoms: z.array(SymptomRelevanceSchema).optional(),
    createdAt: z.date(),
    updatedAt: z.date(),
  });

  export type PlanPrimitiveDto = z.infer<typeof PlanPrimitiveSchema>;
  

export const CreatePlanPrimitiveSchema = PlanPrimitiveSchema.omit({
    id: true,
    createdAt: true,
    updatedAt: true,
});
export type CreatePlanPrimitiveDto = z.infer<typeof CreatePlanPrimitiveSchema>;
