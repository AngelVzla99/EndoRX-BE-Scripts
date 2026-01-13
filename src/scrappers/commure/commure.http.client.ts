import { HttpClient } from "../../clients/http.client.ts";
import { HttpClientType } from "../../clients/http.client.ts";
import { ConfigService } from "../../config/config.service.ts";
import { LoggerClient } from "../../clients/logger.client.ts";
import { Config } from "../../config/config.types.ts";
import { GetScribesResponse } from "./commure.dtos.ts";

export class CommureHttpClient {
  private client: HttpClient;
  private config: Config;
  private logger: LoggerClient;

  constructor() {
    this.config = new ConfigService().getConfig();
    this.logger = new LoggerClient();
    this.client = new HttpClient(HttpClientType.COMMURE);

    this.logger.info("Commure configuration loaded:", {
      url: this.config.commure.url,
      authToken: this.config.commure.authToken,
    });
  }

  getCommureQuery() {
    return `query GetScribes($offset: Int!) {
      scribes(
        where: {deleted_at: {_is_null: true}, archived_at: {_is_null: true}}
        order_by: {started_recording_at: desc}
        limit: 20
        offset: $offset
      ) {
        ...ScribeFields
        __typename
      }
    }
    
    fragment ScribeFields on scribes {
      created_at
      updated_at
      id
      patient_name
      started_recording_at
      ended_recording_at
      audio_length_in_seconds
      status
      template {
        id
        name
        definition
        __typename
      }
      additional_context
      transcription
      clinical_documentation
      cpt_codes
      icd_codes
      deleted_at
      archived_at
      user_template_id
      patient_email
      citations
      patient_id
      scribe_rating {
        id
        is_satisfied
        reasons
        feedback
        __typename
      }
      scribe_attachments(
        where: {deleted_at: {_is_null: true}}
        order_by: {created_at: asc}
      ) {
        created_at
        updated_at
        id
        scribe_id
        scribe_attachment_type
        user_id
        text_raw_or_extracted
        deleted_at
        __typename
      }
      __typename
    }`
  }
  
  public async getCommureData(offset: number = 0): Promise<GetScribesResponse> {
    const body = {
      operationName: "GetScribes",
      variables: { offset },
      query: this.getCommureQuery(),
    };

    const headers = {
      "User-Agent": "Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:145.0) Gecko/20100101 Firefox/145.0",
      "Accept": "*/*",
      "Accept-Language": "en-US,en;q=0.5",
      "Accept-Encoding": "gzip, deflate, br, zstd",
      "Referer": "https://scribe.commure.com/",
      "content-type": "application/json",
      "authorization": `Bearer ${this.config.commure.authToken}`,
      "Origin": "https://scribe.commure.com",
      "Connection": "keep-alive",
      "Sec-Fetch-Dest": "empty",
      "Sec-Fetch-Mode": "cors",
      "Sec-Fetch-Site": "cross-site",
      "Priority": "u=4",
      "TE": "trailers"
    };

    const response = await this.client.post<typeof body, GetScribesResponse>(
      this.config.commure.url, 
      body, 
      headers
    );

    if(response.status !== 200) {      
      throw new Error(`Failed to get commure data: ${response.statusText}`);
    }
    
    return response.data;
  }
}