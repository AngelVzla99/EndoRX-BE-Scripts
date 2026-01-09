import { CommureHttpClient } from "./commure.http.client.js";
import { AudioScribeRepository } from "./audio-scribe.repository.js";
import { mapScribeApiResponseToCreateDto, mapAudioScribeEntityToDto } from "./audio-scribe.mapper.js";
import { AudioScribeDto } from "./audio-scribe.dto.js";
import { LoggerClient } from "../../clients/logger.client.js";
import { ScribeApiResponse } from "./commure.dtos.js";

export class CommureService {
  private httpClient: CommureHttpClient;
  private audioScribeRepository: AudioScribeRepository;
  private logger: LoggerClient;

  constructor() {
    this.httpClient = new CommureHttpClient();
    this.audioScribeRepository = new AudioScribeRepository();
    this.logger = new LoggerClient();
  }

  private async createAudioScribe(scribeApiResponse: ScribeApiResponse): Promise<AudioScribeDto | null> {
    try {
      const createDto = mapScribeApiResponseToCreateDto(scribeApiResponse);
      const entity = await this.audioScribeRepository.createAudioScribe(createDto);
      const audioScribeDto = mapAudioScribeEntityToDto(entity);    
      
      return audioScribeDto;
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : ''
      this.logger.error("Error saving audioScribe: "+errorMessage, {
        providerId: scribeApiResponse.id,
        error: error instanceof Error ? error.message : null,
      });
      return null;
    }
  }

  private async createInBatchAudioScribe(scribesApiResponses: ScribeApiResponse[]): Promise<AudioScribeDto[]> {
    const savedScribes: AudioScribeDto[] = [];

    // Create elements one by one
    for (const scribeApiResponse of scribesApiResponses) {
      const audioScribeDto = await this.createAudioScribe(scribeApiResponse);
      
      if (audioScribeDto) {
        savedScribes.push(audioScribeDto);
      }
    }

    this.logger.info("Batch audio scribe creation completed", {
      total: scribesApiResponses.length,
      saved: savedScribes.length,
    });

    return savedScribes;
  }

  private async getCommureDataByOffset(offset: number): Promise<AudioScribeDto[]> {
    const scribesApiResponse = await this.httpClient.getCommureData(offset);
    const savedScribes = await this.createInBatchAudioScribe(scribesApiResponse.data.scribes);

    this.logger.info("Commure data processing completed by offset", {
      offset,
      total: scribesApiResponse.data.scribes.length,
      saved: savedScribes.length,
    });

    return savedScribes;
  }

  private randomDelay(): Promise<void> {
    // delay between 7 and 15 seconds
    const delay = Math.floor(Math.random() * (15000 - 7000 + 1)) + 3000;
    this.logger.info('Random delay: ' + delay + 'ms');
    return new Promise((resolve) => {
      setTimeout(resolve, delay);
    });
  }

  async getCommureData(): Promise<AudioScribeDto[]> {
    const startOffset = 40;
    const maxOffset = 500;
    const savedScribes: AudioScribeDto[] = [];

    for (let offset = startOffset; offset < maxOffset; offset += 20) {
      await this.randomDelay();
      const scribes = await this.getCommureDataByOffset(offset);
      savedScribes.push(...scribes);
    }

    // 2025-11-26 18:04:21 [error]: Error saving audioScribe: Cannot read properties of null (reading 'plan')

    return savedScribes;
  }
}