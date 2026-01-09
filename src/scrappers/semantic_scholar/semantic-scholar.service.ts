import { SemanticScholarHttpClient } from "./semantic-scholar.http.client.js";
import { GetPapersFromAuthorResponseDto, SemanticScholarFullDataPaperDto } from "./semantic-scholar.dto.js";
import { LoggerClient } from "../../clients/logger.client.js";

export class SemanticScholarService {
  private httpClient: SemanticScholarHttpClient;
  private logger: LoggerClient;

  constructor() {
    this.httpClient = new SemanticScholarHttpClient();
    this.logger = new LoggerClient();
  }

  public async getPapersFromAuthor(authorName: string): Promise<SemanticScholarFullDataPaperDto[]> {
    const authors = await this.searchAuthors(authorName);

    this.logger.info("[SEMANTIC_SCHOLAR] Found authors "+authors.length);

    const papers : SemanticScholarFullDataPaperDto[] = [];
    for (const author of authors) {
      const papersResponse = await this.getPapersByAuthorId(author.authorId);


      this.logger.info("[SEMANTIC_SCHOLAR] Found papers "+papersResponse.length);
      papers.push(...papersResponse);
    }
    return papers;
  }

  public async getDataByDoi(doi: string): Promise<SemanticScholarFullDataPaperDto> {
    const paper = await this.httpClient.findPaperByDoi(doi);
    return paper;
  }

  private async getPapersByAuthorId(authorId: string): Promise<SemanticScholarFullDataPaperDto[]> {
    const papersResponse = await this.httpClient.findPapersByAuthorId(authorId);
    return papersResponse.data;
  }

  private async searchAuthors(authorName: string) {
    const authorsResponse = await this.httpClient.findAuthors(authorName);
    if (!authorsResponse.data || authorsResponse.data.length === 0) {
        throw new Error(`No authors found with name: ${authorName}`);
      }
    return authorsResponse.data;
  }
}

