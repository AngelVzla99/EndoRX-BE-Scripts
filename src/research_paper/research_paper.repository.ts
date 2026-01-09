import { ResearchPaperModel, ResearchPaperEntity } from "./research_paper.model.js";
import { CreateResearchPaperDto, ExternalIdsDto } from "./research_paper.dto.js";
import { LoggerClient } from "../clients/logger.client.js";

export class ResearchPaperRepository {
  async createResearchPaper(dto: CreateResearchPaperDto): Promise<ResearchPaperEntity> {    
    const researchPaper = new ResearchPaperModel({
      externalIds: dto.externalIds,
      title: dto.title,
      publicLink: dto.publicLink,
    });

    const savedResearchPaper = await researchPaper.save();
    return savedResearchPaper.toObject();  
  }

  async findByExternalIds(externalIds: ExternalIdsDto): Promise<ResearchPaperEntity | null> {
    const conditions: any[] = [];

    if (externalIds.semanticSchollarId) {
      conditions.push({ 'externalIds.semanticSchollarId': externalIds.semanticSchollarId });
    }

    if (externalIds.DOI) {
      conditions.push({ 'externalIds.DOI': externalIds.DOI });
    }

    if (externalIds.pubmedId) {
      conditions.push({ 'externalIds.pubmedId': externalIds.pubmedId });
    }

    if (externalIds.pmcid) {
      conditions.push({ 'externalIds.pmcid': externalIds.pmcid });
    }

    if (conditions.length === 0) {
      return null;
    }

    const researchPaper = await ResearchPaperModel.findOne({ $or: conditions }).exec();
    return researchPaper ? researchPaper.toObject() : null;
  }

  async getMissingPdfUrl(): Promise<ResearchPaperEntity[]>{
    const papers = await ResearchPaperModel.find({ 
      publicLink: { $regex: /^https:\/\/doi\.org/ } 
    }).exec();
    
    return papers.map(paper => paper.toObject());
  }

  async updatePdfUrl(id: string, pdfUrl: string): Promise<ResearchPaperEntity | null> {
    const researchPaper = await ResearchPaperModel.findByIdAndUpdate(
      id,
      { pdfUrl },
      { new: true }
    ).exec();
    
    return researchPaper ? researchPaper.toObject() : null;
  }
}

