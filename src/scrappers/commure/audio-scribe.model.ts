import { Schema, model, InferSchemaType, Types } from "mongoose";

const clinicalDocumentationSchema = new Schema({
  plan: { type: String, required: false },
  objective: { type: String, required: false },
  assessment: { type: String, required: false },
  subjective: { type: String, required: false },
}, { _id: false });

const audioScribeSchema = new Schema({
  providerId: { type: String, required: true, unique: true },
  providerCreatedAt: { type: Date, required: true },
  clinicalDocumentation: { type: clinicalDocumentationSchema, required: true },
}, {
  timestamps: true,
});

export type AudioScribeEntity = InferSchemaType<typeof audioScribeSchema> & {
  _id: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
};

export const AudioScribeModel = model<AudioScribeEntity>('audio_scribes', audioScribeSchema);

