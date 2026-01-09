import { z } from "zod";

export const CreateResearchPaperEmbeddingSchema = z.object({
  text: z.string(),
  embedding: z.array(z.number()),
  researchPaperId: z.string(),
});

export type CreateResearchPaperEmbeddingDto = z.infer<typeof CreateResearchPaperEmbeddingSchema>;

