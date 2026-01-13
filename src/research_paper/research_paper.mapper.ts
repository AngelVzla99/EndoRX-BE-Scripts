import { ResearchPaperEntity } from "./research_paper.model.ts";
import { ResponseResearchPaperDto, ExternalIdsDto } from "./research_paper.dto.ts";

export function mapResearchPaperEntityToResponseDto(
  entity: ResearchPaperEntity
): ResponseResearchPaperDto {
  const externalIds: ExternalIdsDto | undefined = entity.externalIds ? {
    semanticSchollarId: entity.externalIds.semanticSchollarId ?? undefined,
    DOI: entity.externalIds.DOI ?? undefined,
    pubmedId: entity.externalIds.pubmedId ?? undefined,
  } : undefined;

  return {
    id: entity._id.toString(),
    externalIds,
    title: entity.title ?? undefined,
    publicLink: entity.publicLink ?? undefined,
    createdAt: entity.createdAt,
    updatedAt: entity.updatedAt,
  };
}

