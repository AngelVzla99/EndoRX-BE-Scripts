export { ResearchPaperService } from "./research_paper.service.ts";
export { ResearchPaperRepository } from "./research_paper.repository.ts";
export { ResearchPaperModel, type ResearchPaperEntity } from "./research_paper.model.ts";
export { 
  CreateResearchPaperSchema, 
  ResponseResearchPaperSchema,
  ExternalIdsSchema,
  type CreateResearchPaperDto,
  type ResponseResearchPaperDto,
  type ExternalIdsDto
} from "./research_paper.dto.ts";
export { mapResearchPaperEntityToResponseDto } from "./research_paper.mapper.ts";

