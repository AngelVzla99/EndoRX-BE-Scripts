import { CreateResearchPaperEmbeddingDto } from "./research_paper_embeddings.dto";
import { ResearchPaperEmbeddingEntity } from "./research_paper_embeddings.model";

export function mapEntityToDto(entity: ResearchPaperEmbeddingEntity): CreateResearchPaperEmbeddingDto {
  return {
    text: entity.text,
    embedding: entity.embedding,
    researchPaperId: entity.researchPaperId.toString(),
  };
}

