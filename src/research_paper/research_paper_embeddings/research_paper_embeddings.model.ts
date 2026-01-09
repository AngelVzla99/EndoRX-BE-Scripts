import { Schema, model, InferSchemaType, Types } from "mongoose";

const researchPaperEmbeddingsSchema = new Schema({
  text: { type: String, required: true },
  embedding: { type: [Number], required: true },
  researchPaperId: { type: Schema.Types.ObjectId, required: true },
}, {
  timestamps: true,
});

export type ResearchPaperEmbeddingEntity = InferSchemaType<typeof researchPaperEmbeddingsSchema> & {
  _id: Types.ObjectId;
  researchPaperId: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
};

export const ResearchPaperEmbeddingModel = model<ResearchPaperEmbeddingEntity>('research_paper_embeddings', researchPaperEmbeddingsSchema);

