import { HttpClient, HttpClientType } from "../../clients/http.client.ts";
import { 
  FindAuthorsResponseDto, 
  FindAuthorsResponseSchema,
  FindPapersByAuthorIdResponseDto,
  FindPapersByAuthorIdResponseSchema,
  SemanticScholarFullDataPaperDto,
  SemanticScholarFullDataSchema
} from "./semantic-scholar.dto.ts";

export class SemanticScholarHttpClient {
  private client: HttpClient;
  private baseUrl: string = "https://api.semanticscholar.org/graph/v1";

  constructor() {
    this.client = new HttpClient(HttpClientType.SEMANTIC_SCHOLAR);
  }

  public async findAuthors(authorName: string): Promise<FindAuthorsResponseDto> {
    const url = `${this.baseUrl}/author/search?query=${authorName}`;

    const response = await this.client.get<FindAuthorsResponseDto>(url);

    if (response.status !== 200) {
      throw new Error(`Failed to fetch authors: ${response.statusText}`);
    }

    const validatedData = FindAuthorsResponseSchema.parse(response.data);

    return validatedData;
  }

  public async findPapersByAuthorId(
    authorId: string, 
    fields: string[] = ["title", "openAccessPdf", "externalIds", "authors", "fieldsOfStudy", "abstract"]
  ): Promise<FindPapersByAuthorIdResponseDto> {
    const fieldsParam = fields.join(",");
    const url = `${this.baseUrl}/author/${authorId}/papers?fields=${fieldsParam}`;

    const response = await this.client.get<FindPapersByAuthorIdResponseDto>(url);

    if (response.status !== 200) {
      throw new Error(`Failed to fetch papers for author ${authorId}: ${response.statusText}`);
    }

    const validatedData = FindPapersByAuthorIdResponseSchema.parse(response.data);

    return validatedData;
  }

  public async findPaperByDoi(
    doi: string,
    fields: string[] = ["title", "openAccessPdf", "externalIds", "authors", "fieldsOfStudy", "abstract"]
  ): Promise<SemanticScholarFullDataPaperDto> {
    const fieldsParam = fields.join(",");
    const url = `${this.baseUrl}/paper/DOI:${doi}?fields=${fieldsParam}`;

    const response = await this.client.get<SemanticScholarFullDataPaperDto>(url);

    if (response.status !== 200) {
      throw new Error(`Failed to fetch paper with DOI ${doi}: ${response.statusText}`);
    }

    const validatedData = SemanticScholarFullDataSchema.parse(response.data);

    return validatedData;
  }
}

