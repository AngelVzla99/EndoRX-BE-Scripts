import { Schema, model, InferSchemaType, Types } from "mongoose";

const externalIdsSchema = new Schema({
  semanticSchollarId: { type: String, required: false },
  DOI: { type: String, required: false },
  pubmedId: { type: String, required: false },
  pmcid: { type: String, required: false },
}, { _id: false });

const researchPaperSchema = new Schema({
  externalIds: { type: externalIdsSchema, required: true },
  title: { type: String, required: true },
  publicLink: { type: String, required: true },
  pdfUrl: { type: String, required: false },
}, {
  timestamps: true,
});

export type ResearchPaperEntity = InferSchemaType<typeof researchPaperSchema> & {
  _id: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
};

export const ResearchPaperModel = model<ResearchPaperEntity>('research_papers', researchPaperSchema);

