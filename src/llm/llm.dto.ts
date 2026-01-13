import { z } from "zod";
import { PlanPrimitiveSchema } from "../plan-primitives/plan-primitives.dto.ts";

export const GetPdfResponseSchema = z.object({
    pdfUrl: z.string(),
});

export type GetPdfResponseDto = z.infer<typeof GetPdfResponseSchema>;

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

export const AssistantPrimitiveSchema = PlanPrimitiveSchema.omit({
    id: true,
    createdAt: true,
    updatedAt: true,
});

export const GeneratePrimitivesResponseSchema = z.object({
    primitives: z.array(AssistantPrimitiveSchema),
});

export const GetDuplicatedSchema = z.object({
    id: z.number(),
    text: z.string(),
    embedding: z.string().optional(),
});

export type PrimitiveDto = z.infer<typeof AssistantPrimitiveSchema>;
export type GeneratePrimitivesResponseDto = z.infer<typeof GeneratePrimitivesResponseSchema>;
export type GetDuplicatedDto = z.infer<typeof GetDuplicatedSchema>;