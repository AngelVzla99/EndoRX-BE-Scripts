import { CreateResearchPaperEmbeddingDto } from "./research_paper_embeddings.dto.js";
import { ResearchPaperEmbeddingEntity } from "./research_paper_embeddings.model.js";

export function mapEntityToDto(entity: ResearchPaperEmbeddingEntity): CreateResearchPaperEmbeddingDto {
  return {
    text: entity.text,
    embedding: entity.embedding,
    researchPaperId: entity.researchPaperId.toString(),
  };
}

