import { Schema, model, InferSchemaType, Types } from "mongoose";
import { SymptomEnum } from "../llm/llm.dto.js";

const RelevantSymptomSchema = new Schema({
  type: {
    type: String,
    required: true,
    enum: Object.values(SymptomEnum),
  },
  relevance: { type: Number, required: true, min: 1, max: 5 },
});

export type RelevantSymptomEntity = InferSchemaType<
  typeof RelevantSymptomSchema
> & {
  _id: Types.ObjectId;
};

const planPrimitiveSchema = new Schema(
  {
    shortDescription: { type: String, required: true },
    domain: { type: String, required: true },
    clinicalDescription: { type: String, required: true },
    repetitionDays: { type: Number, required: true },
    frequencyPerWeek: { type: Number, required: true },
    timeBurdenMinutesPerDay: { type: Number, required: true },
    mechanismTags: { type: [String], required: true },
    contraindicationTags: { type: [String], required: true },
    relevantSymptoms: {
      type: [RelevantSymptomSchema],
      required: false,
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

export type PlanPrimitiveEntity = InferSchemaType<
  typeof planPrimitiveSchema
> & {
  _id: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
};

export const PlanPrimitiveModel = model<PlanPrimitiveEntity>(
  "plan_primitives",
  planPrimitiveSchema
);

export function calculateRepetitionDays(frequencyPerWeek: number): number {
  if (frequencyPerWeek <= 0) {
    throw new Error("frequencyPerWeek must be greater than zero");
  }

  const daysPerWeek = 7;
  const repetitionDays = Math.floor(daysPerWeek / frequencyPerWeek);
  return repetitionDays < 1 ? 1 : repetitionDays;
}
