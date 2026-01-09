export { ResearchPaperService } from "./research_paper.service.js";
export { ResearchPaperRepository } from "./research_paper.repository.js";
export { ResearchPaperModel, type ResearchPaperEntity } from "./research_paper.model.js";
export { 
  CreateResearchPaperSchema, 
  ResponseResearchPaperSchema,
  ExternalIdsSchema,
  type CreateResearchPaperDto,
  type ResponseResearchPaperDto,
  type ExternalIdsDto
} from "./research_paper.dto.js";
export { mapResearchPaperEntityToResponseDto } from "./research_paper.mapper.js";

