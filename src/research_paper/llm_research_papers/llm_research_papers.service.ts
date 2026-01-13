import { LoggerClient } from "../../clients/logger.client.ts";
import { ResearchPaperService } from "../research_paper.service.ts";
import { LLMService } from "../../llm/llm.service.ts";

export class LLMResearchPapersService {
  private researchPaperService: ResearchPaperService;
  private logger: LoggerClient;
  private llmService: LLMService;

  constructor() {
    this.researchPaperService = new ResearchPaperService();
    this.logger = new LoggerClient();
    this.llmService = new LLMService();
  }

  async populateDatabase(){
    const papers = await this.researchPaperService.getPapersWithMissingUrls();
    
    this.logger.info(`Found ${papers.length} papers with missing PDF URLs`);
    
    for (const paper of papers) {
      const doiUrl = paper.publicLink;
      const paperId = paper._id.toString();
      
      try {
        this.logger.info(`Processing paper: ${paperId}`, { doiUrl });
        
        const pdfUrl = await this.llmService.getPdfUrl(doiUrl);
        
        if (pdfUrl) {
          this.logger.info(`Found PDF URL for paper ${paperId}`, { pdfUrl: pdfUrl });
          await this.researchPaperService.updatePdfUrl(paperId, pdfUrl);
        } else {
          this.logger.warn(`No PDF URL found for paper ${paperId}`, { doiUrl });
        }
        
      } catch (error) {
        this.logger.error(`Error processing paper ${paperId}`, {
          doiUrl,
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }
    
    await this.llmService.close();
    this.logger.info('Database population completed');
  }
}