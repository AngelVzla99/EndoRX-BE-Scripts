import { ResearchPaperRepository } from "./research_paper.repository.ts";
import { CreateResearchPaperDto, ResponseResearchPaperDto, ExternalIdsDto, CreateResearchPaperSchema } from "./research_paper.dto.ts";
import { mapResearchPaperEntityToResponseDto } from "./research_paper.mapper.ts";
import { LoggerClient } from "../clients/logger.client.ts";
import { ExistingResearchPaperError, InvalidExternalIdsError, NoValidTitlesError } from "./research_paper.error.ts";
import { CustomError } from "../types/types.ts";

export class ResearchPaperService {
  private researchPaperRepository: ResearchPaperRepository;
  private logger: LoggerClient;

  constructor() {
    this.researchPaperRepository = new ResearchPaperRepository();
    this.logger = new LoggerClient();
  }

  async findByExternalIds(externalIds: ExternalIdsDto): Promise<ResponseResearchPaperDto | null> {
    const researchPaperEntity = await this.researchPaperRepository.findByExternalIds(externalIds);
    
    if (!researchPaperEntity) {
      return null;
    }

    return mapResearchPaperEntityToResponseDto(researchPaperEntity);
  }

  private async create(dtoWithoutValidation: CreateResearchPaperDto): Promise<ResponseResearchPaperDto> {
    const dto = CreateResearchPaperSchema.parse(dtoWithoutValidation);
    
    if (!dto.externalIds.DOI && !dto.externalIds.pubmedId && !dto.externalIds.semanticSchollarId) {
      throw new InvalidExternalIdsError("External IDs are required");
    }

    const existingResearchPaper = await this.findByExternalIds(dto.externalIds);
    if (existingResearchPaper) {
      // const ids = Object.values(existingResearchPaper.externalIds ?? {}).join(", ");
      // throw new ExistingResearchPaperError(`Research paper already exists with external ids: ${ids}.`);
      return existingResearchPaper;
    }

    const title = dto.title.trim().toLowerCase();
    if(!title.includes("endometriosis")) {
      throw new NoValidTitlesError(title);
    }

    const researchPaperEntity = await this.researchPaperRepository.createResearchPaper(dto);
    const responseDto = mapResearchPaperEntityToResponseDto(researchPaperEntity);
    return responseDto;
  }

  async createInBatch(dtoList: CreateResearchPaperDto[]): Promise<ResponseResearchPaperDto[]> {
    const result : ResponseResearchPaperDto[] = [];

    for (const dto of dtoList) {
      try {
        const responseDto = await this.create(dto);
        result.push(responseDto);
      } catch (error) {
        this.logger.error("Error in create research paper service:", {
          title: dto.title,
          name: error instanceof CustomError ? error.name : 'Parent error',
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }

    this.logger.info("Batch research paper creation completed", {
      total: dtoList.length,
      saved: result.length,
    });

    return result;
  }

  // ============ fix missing urls ==========

  async getPapersWithMissingUrls(){
    const papers = await this.researchPaperRepository.getMissingPdfUrl();
    return papers;
  }

  async updatePdfUrl(id: string, pdfUrl: string): Promise<void> {
    await this.researchPaperRepository.updatePdfUrl(id, pdfUrl);
  }
}

