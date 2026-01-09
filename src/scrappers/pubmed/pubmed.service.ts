import { PubMedHttpClient } from "./pubmed.http.client.js";
import { GetAuthorPaperIdsResponseDto, GetPapersByIdsResponseDto, PubMedPaperDto, GetPapersBodiesResponseDto } from "./pubmed.dto.js";
import { mapArticlesToPubMedPapers, mapMedlineCitationDtoGetPapersByIdsResponseDto, mapArticlesBodiesWithIds } from "./pubmed.mapper.js";

export class PubMedService {
  private httpClient: PubMedHttpClient;

  constructor() {
    this.httpClient = new PubMedHttpClient();
  }

  private async getAuthorPaperIds(authorFullName: string, database: string): Promise<GetAuthorPaperIdsResponseDto> {
    const searchResponse = await this.httpClient.searchAuthorPapers(authorFullName, database);

    const result = searchResponse.eSearchResult;

    if (result.ErrorList || result.WarningList) {
      const errorMessage = result.ErrorList?.PhraseNotFound || result.WarningList?.OutputMessage || "No papers found";
      throw new Error(`PubMed search failed for author "${authorFullName}": ${errorMessage}`);
    }

    const count = typeof result.Count === 'string' ? parseInt(result.Count) : result.Count;
    if (count === 0) {
      throw new Error(`No papers found for author "${authorFullName}"`);
    }

    if (typeof result.IdList === 'string') {
      throw new Error(`No papers found for author "${authorFullName}"`);
    }

    const idList = result.IdList.Id;

    if (Array.isArray(idList)) {
      return idList.map(id => String(id));
    }

    return [String(idList)];
  }

  private async getPapersByIdsPMC(ids: string[]): Promise<GetPapersByIdsResponseDto> {
    const fetchResponse = await this.httpClient.fetchPapersByIds(ids, "pmc");
    const articles = fetchResponse["pmc-articleset"].article;
    if(!articles) {
      return [];
    }
    return mapArticlesToPubMedPapers(articles);
  }

  async getPapersBodyPMC(ids: string[]): Promise<GetPapersBodiesResponseDto> {
    const fetchResponse = await this.httpClient.fetchPapersBodies(ids, "pmc");
    const articles = fetchResponse["pmc-articleset"].article;
    if(!articles) {
      return [];
    }
    return mapArticlesBodiesWithIds(articles);
  }

  private async getPapersByIdsPubMed(ids: string[]): Promise<GetPapersByIdsResponseDto> {
    const fetchResponse = await this.httpClient.fetchPapersByIdsPubmedDatabase(ids);
    if(!fetchResponse.PubmedArticleSet?.PubmedArticle?.length) {
      return [];
    }
    const dtos : PubMedPaperDto[] = [];
    for (const article of fetchResponse.PubmedArticleSet.PubmedArticle) {
      if(article.MedlineCitation.Article) {
        dtos.push(mapMedlineCitationDtoGetPapersByIdsResponseDto(article.MedlineCitation.Article));
      }
    }
    return dtos;
  }

  private getPapersByIds(ids: string[], database: string): Promise<GetPapersByIdsResponseDto> {
    switch (database) {
      case "pmc":
        return this.getPapersByIdsPMC(ids);
      case "pubmed":
        return this.getPapersByIdsPubMed(ids);
      default:
        throw new Error(`Invalid database: ${database}`);
    }
  }

  public async getAuthorPapers(authorFullName: string, keyWordsFilter: string[], database: string = "pmc"): Promise<PubMedPaperDto[]> {
    const ids = await this.getAuthorPaperIds(authorFullName, database);
    const papers = await this.getPapersByIds(ids, database);

    console.log("Number of papers found: ", papers.length);

    const filteredPapers = papers.filter(paper => {
        const textKeywords = paper.keywords?.join(' ');
        const textTitle = paper.title;
        const fullText = `${textKeywords} ${textTitle}`.toLowerCase();
        return keyWordsFilter.some(keyword => fullText.includes(keyword.toLowerCase()));
    });

    console.log("Number of filtered papers: ", filteredPapers.length);

    return filteredPapers;
  }
}

