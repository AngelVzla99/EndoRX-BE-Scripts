import { z } from "zod";

// External IDs schema for research paper
export const ExternalIdsSchema = z.object({
  semanticSchollarId: z.string().nullish(),
  DOI: z.string().nullish(),
  pubmedId: z.string().nullish(),
  pmcid: z.string().nullish(),
});

export type ExternalIdsDto = z.infer<typeof ExternalIdsSchema>;

// Create research paper DTO schema
export const CreateResearchPaperSchema = z.object({
  externalIds: ExternalIdsSchema,
  title: z.string(),
  publicLink: z.string(),
});

export type CreateResearchPaperDto = z.infer<typeof CreateResearchPaperSchema>;

// Response research paper DTO schema
export const ResponseResearchPaperSchema = z.object({
  id: z.string(),
  externalIds: ExternalIdsSchema.optional(),
  title: z.string().optional(),
  publicLink: z.string().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type ResponseResearchPaperDto = z.infer<typeof ResponseResearchPaperSchema>;

