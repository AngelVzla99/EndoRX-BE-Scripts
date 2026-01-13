import { AudioScribeModel, AudioScribeEntity } from "./audio-scribe.model.ts";
import { CreateAudioScribeDto } from "./audio-scribe.dto.ts";
import { LoggerClient } from "../../clients/logger.client.ts";

export class AudioScribeRepository {
  private logger: LoggerClient;

  constructor() {
    this.logger = new LoggerClient();
  }

  public async createAudioScribe(dto: CreateAudioScribeDto): Promise<AudioScribeEntity> {
    try {
      const audioScribe = new AudioScribeModel({
        providerId: dto.providerId,
        providerCreatedAt: dto.providerCreatedAt,
        clinicalDocumentation: dto.clinicalDocumentation,
      });

      const savedAudioScribe = await audioScribe.save();
      this.logger.info("Audio scribe created successfully", {
        providerId: savedAudioScribe.providerId,
      });

      return savedAudioScribe.toObject();
    } catch (error) {
      this.logger.error("Error creating audio scribe:", {
        providerId: dto.providerId,
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }
}

