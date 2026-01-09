import { PubMedPaperDto } from "../../scrappers/pubmed/pubmed.dto";
import { SemanticScholarFullDataPaperDto } from "../../scrappers/semantic_scholar/semantic-scholar.dto";
import { CreateResearchPaperDto, CreateResearchPaperSchema } from "../research_paper.dto";

export function mapSemanticScholarPaperDtoToCreateResearchPaperDto(paperDto: SemanticScholarFullDataPaperDto): CreateResearchPaperDto {
  if (!paperDto.openAccessPdf?.url) {
    throw new Error("Open access PDF URL is required");
  }

  const dto = {
    externalIds: {
      semanticSchollarId: paperDto.paperId,
      DOI: paperDto.externalIds.DOI,
      pubmedId: paperDto.externalIds.PubMed,
    },
    title: paperDto.title,
    publicLink: paperDto.openAccessPdf?.url,
  };

  return dto;
}


export function mapPubMedPaperDtoToCreateResearchPaperDto(paperDto: PubMedPaperDto) {
  const dto = {
    externalIds: {
      pubmedId: paperDto.pmid,
      DOI: paperDto.doi,
    },
    title: paperDto.title,
    publicLink: paperDto.doi,
  };
  return dto;
}

export function mapHybridScrapperToCreateResearchPaperDto(paperPubMed: PubMedPaperDto, paperSemanticScholar: SemanticScholarFullDataPaperDto): CreateResearchPaperDto {
  const semanticScholarDto = mapSemanticScholarPaperDtoToCreateResearchPaperDto(paperSemanticScholar);
  const pubMedDto = mapPubMedPaperDtoToCreateResearchPaperDto(paperPubMed);
  return {
    externalIds:{
      pubmedId: semanticScholarDto.externalIds.pubmedId ?? pubMedDto.externalIds.pubmedId,
      DOI: semanticScholarDto.externalIds.DOI ?? pubMedDto.externalIds.DOI,
      semanticSchollarId: semanticScholarDto.externalIds.semanticSchollarId,
    },
    title: semanticScholarDto.title ?? pubMedDto.title,
    publicLink: semanticScholarDto.publicLink ?? pubMedDto.publicLink,
  };
}