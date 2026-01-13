import { HttpClient, HttpClientType } from "../../clients/http.client.ts";
import { XMLParser } from "fast-xml-parser";
import { 
  PubMedSearchResponseDto, 
  PubMedSearchResponseSchema,
  PubMedFetchResponseDto,
  PubMedFetchResponseSchema,
  PubMedDatabaseFetchResponseDto,
  PubMedDatabaseFetchResponseSchema,
  PubMedFetchBodiesResponseSchema,
  PubMedFetchBodiesResponseDto
} from "./pubmed.dto.ts";

export class PubMedHttpClient {
  private client: HttpClient;
  private baseUrl: string = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils";
  private xmlParser: XMLParser;

  constructor() {
    this.client = new HttpClient(HttpClientType.PUBMED);
    this.xmlParser = new XMLParser({
      ignoreAttributes: false,
      parseTagValue: true,
      parseAttributeValue: true,
    });
  }

  private async randomDelay(): Promise<void> {
    const delay = Math.floor(Math.random() * 2000) + 1000;
    return new Promise(resolve => setTimeout(resolve, delay));
  }

  public async searchAuthorPapers(authorFullName: string, database: string = "pmc"): Promise<PubMedSearchResponseDto> {
    await this.randomDelay();
    
    const url = `${this.baseUrl}/esearch.fcgi?db=${database}&term=${encodeURIComponent(authorFullName)}[au]`;

    const response = await this.client.get<string>(url);

    if (response.status !== 200) {
      throw new Error(`Failed to search PubMed for author: ${response.statusText}`);
    }

    const parsedData = this.xmlParser.parse(response.data);
    const validatedData = PubMedSearchResponseSchema.parse(parsedData);

    return validatedData;
  }

  public async fetchPapersByIds(ids: string[], database: string = "pmc"): Promise<PubMedFetchResponseDto> {
    await this.randomDelay();
    
    if(ids.length === 0) {
      return {
        "pmc-articleset": {
          article: [],
        },
      };
    }
    const idsParam = ids.join(',');
    const url = `${this.baseUrl}/efetch.fcgi?db=${database}&id=${idsParam}`;

    const response = await this.client.get<string>(url);

    if (response.status !== 200) {
      throw new Error(`Failed to fetch papers from PubMed: ${response.statusText}`);
    }

    const parsedData = this.xmlParser.parse(response.data);
    const validatedData = PubMedFetchResponseSchema.parse(parsedData);

    return validatedData;
  }

  public async fetchPapersBodies(ids: string[], database: string = "pmc"): Promise<PubMedFetchBodiesResponseDto> {
    await this.randomDelay();
    
    if(ids.length === 0) {
      return {
        "pmc-articleset": {
          article: [],
        },
      };
    }
    const idsParam = ids.join(',');
    const url = `${this.baseUrl}/efetch.fcgi?db=${database}&id=${idsParam}`;

    const response = await this.client.get<string>(url);

    if (response.status !== 200) {
      throw new Error(`Failed to fetch papers from PubMed: ${response.statusText}`);
    }

    const parsedData = this.xmlParser.parse(response.data);
    const validatedData = PubMedFetchBodiesResponseSchema.parse(parsedData);

    return validatedData;
  }

  public async fetchPapersByIdsPubmedDatabase(ids: string[]): Promise<PubMedDatabaseFetchResponseDto> {
    await this.randomDelay();
    
    if(ids.length === 0) {
      return {
        PubmedArticleSet: {
          PubmedArticle: [],
        },
      };
    }
    const idsParam = ids.join(',');
    const url = `${this.baseUrl}/efetch.fcgi?db=pubmed&id=${idsParam}&retmode=xml`;

    const response = await this.client.get<string>(url);

    if (response.status !== 200) {
      throw new Error(`Failed to fetch papers from PubMed database: ${response.statusText}`);
    }

    const parsedData = this.xmlParser.parse(response.data);
    const validatedData = PubMedDatabaseFetchResponseSchema.parse(parsedData);

    return validatedData;
  }
}

