import { Types } from "mongoose";
import { LoggerClient } from "../../clients/logger.client";
import { PaperBodyWithIdsDto } from "../../scrappers/pubmed/pubmed.dto";
import { mapPubMedPaperDtoToCreateResearchPaper, mapPubMedPaperToCreateResearchPaper } from "../../scrappers/pubmed/pubmed.mapper";
import { PubMedService } from "../../scrappers/pubmed/pubmed.service";
import { SemanticScholarService } from "../../scrappers/semantic_scholar/semantic-scholar.service";
import { CreateResearchPaperDto, ExternalIdsDto, ResponseResearchPaperDto } from "../research_paper.dto";
import { ResearchPaperService } from "../research_paper.service";
import { mapHybridScrapperToCreateResearchPaperDto, mapPubMedPaperDtoToCreateResearchPaperDto, mapSemanticScholarPaperDtoToCreateResearchPaperDto } from "./scrapper_research_paper.mapper";
import { LangchainVectorStore } from "../../llm/llm.vector.store";
import { getDbConfigForResearchPaperVectorSearch, ResearchPaperEmbeddingsService } from "../research_paper_embeddings/research_paper_embeddings.service";

export class ScrapperResearchPaperService {
  keyWordsFilter = [
    "endometriosis",
  ];

  private researchPaperService: ResearchPaperService;
  private semanticScholarService: SemanticScholarService;
  private pubmedService: PubMedService;
  private logger: LoggerClient;

  constructor() {
    this.semanticScholarService = new SemanticScholarService();
    this.researchPaperService = new ResearchPaperService();
    this.logger = new LoggerClient();
    this.pubmedService = new PubMedService();
  }

  async getAndSaveResearchPaperSemanticScholar(authorName: string): Promise<void> {
    const papers = await this.semanticScholarService.getPapersFromAuthor(authorName);
    const dtoCreate : CreateResearchPaperDto[] = [];
    for (const paper of papers) {
      try{
        dtoCreate.push(mapSemanticScholarPaperDtoToCreateResearchPaperDto(paper));
      } catch (error) {
        // this is intended to not fail the whole process      
      }
    }
    await this.researchPaperService.createInBatch(dtoCreate);
  }

  async getAndSaveResearchPaperHybridScrapper(authorName: string): Promise<void> {
    const fullName = authorName.replace('+', ' ');
    const pubMedpapers = await this.pubmedService.getAuthorPapers(fullName, this.keyWordsFilter);

    const dtoPapers : CreateResearchPaperDto[] = [];
    for (const paperPubMed of pubMedpapers) {
      if (!paperPubMed.doi) {
        continue;
      }

      const searchDto : ExternalIdsDto = { DOI: paperPubMed.doi, pubmedId: paperPubMed.pmid };
      const existingResearchPaper = await this.researchPaperService.findByExternalIds(searchDto);
      if (existingResearchPaper) {
        this.logger.info("Research paper already exists, with doi: "+paperPubMed.doi+" and pubmedId: "+paperPubMed.pmid);
        continue;
      }

      try{
        const semanticScholarPaper = await this.semanticScholarService.getDataByDoi(paperPubMed.doi);
        const mappedDto = mapHybridScrapperToCreateResearchPaperDto(paperPubMed, semanticScholarPaper);        
        dtoPapers.push(mappedDto);
      } catch (error) {
        this.logger.error("Error getting semantic scholar data for paper: "+paperPubMed.doi + ' | ' + (error instanceof Error ? error.message : String(error)), {
          error: error instanceof Error ? error.message : String(error),
        });
        // this is intended to not fail the whole process      
      }
    }
    await this.researchPaperService.createInBatch(dtoPapers);
  }

  // akes the full text commming from pued api
  async getAndSaveResearchPubsubScrapper(authorName: string): Promise<void> {
    const fullName = authorName.replace('+', ' ');
    const pubMedpapers = await this.pubmedService.getAuthorPapers(fullName, this.keyWordsFilter, 'pmc');

    // Get body of the papers
    let pubmedIds : string[] = [];
    for (const paperPubMed of pubMedpapers) {
      if (!paperPubMed.pmcid) {
        continue;
      }
      pubmedIds.push(paperPubMed.pmcid);
    }
    const pubmedBodies = await this.pubmedService.getPapersBodyPMC(pubmedIds);
    const mapPmciToPubMedPaper = new Map<string, PaperBodyWithIdsDto>();
    for (const paper of pubmedBodies) {
      if (!paper?.pmcid) {
        continue;
      }
      mapPmciToPubMedPaper.set(paper.pmcid, paper);
    }

    const dtoPapers : CreateResearchPaperDto[] = [];
    for (const paper of pubMedpapers) {
      if (!paper?.pmcid) {
        continue;
      }
      const pubMedPaperBody = mapPmciToPubMedPaper.get(paper.pmcid);
      if (!pubMedPaperBody) {
        continue;
      }
      const dto = mapPubMedPaperDtoToCreateResearchPaper(paper);
      dtoPapers.push(dto);
    }

    const createdPapers = await this.researchPaperService.createInBatch(dtoPapers);
    
    await this.storeBodiesAsVectors(pubmedBodies, createdPapers);
  }

  private async storeBodiesAsVectors(bodies: PaperBodyWithIdsDto[], createdPapers: ResponseResearchPaperDto[]): Promise<void> {
    const dbConfig = await getDbConfigForResearchPaperVectorSearch();
    const vectorStore = new LangchainVectorStore(dbConfig);
    const embeddingsService = new ResearchPaperEmbeddingsService();

    for (const paper of createdPapers) {
      const embeddingsExist = await embeddingsService.existsByResearchPaperId(paper.id);
      if (embeddingsExist) {
        this.logger.info("Embeddings already exist for paper, skipping", {
          paperId: paper.id,
          title: paper.title,
        });
        continue;
      }

      const matchingBody = bodies.find(body => 
        (body.pmcid && paper.externalIds?.pmcid === body.pmcid) ||
        (body.pmid && paper.externalIds?.pubmedId === body.pmid) ||
        (body.doi && paper.externalIds?.DOI === body.doi)
      );

      if (!matchingBody || !matchingBody.body) {
        this.logger.info("No matching body found for paper", {
          paperId: paper.id,
          title: paper.title,
        });
        continue;
      }

      try {
        await vectorStore.storeText(matchingBody.body, {
          researchPaperId: new Types.ObjectId(paper.id),
          title: paper.title,
          pmcid: matchingBody.pmcid,
          pmid: matchingBody.pmid,
          doi: matchingBody.doi,
          source: 'pubmed-script'
        });

        this.logger.info("Successfully stored embeddings for paper", {
          paperId: paper.id,
          title: paper.title,
        });
      } catch (error) {
        this.logger.error("Error storing embeddings for paper", {
          paperId: paper.id,
          title: paper.title,
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }
  }
}