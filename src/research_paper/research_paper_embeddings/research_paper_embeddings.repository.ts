import { Types } from "mongoose";
import { LoggerClient } from "../../clients/logger.client.js";
import { CreateResearchPaperEmbeddingDto } from "./research_paper_embeddings.dto.js";
import { ResearchPaperEmbeddingEntity, ResearchPaperEmbeddingModel } from "./research_paper_embeddings.model.js";

export class ResearchPaperEmbeddingsRepository {
  private logger: LoggerClient;

  constructor() {
    this.logger = new LoggerClient();
  }

  public async create(dto: CreateResearchPaperEmbeddingDto): Promise<ResearchPaperEmbeddingEntity> {
    const embedding = new ResearchPaperEmbeddingModel({
      text: dto.text,
      embedding: dto.embedding,
      researchPaperId: new Types.ObjectId(dto.researchPaperId),
    });

    const savedEmbedding = await embedding.save();
    return savedEmbedding.toObject();
  }

  public async createInBatch(dtos: CreateResearchPaperEmbeddingDto[]): Promise<ResearchPaperEmbeddingEntity[]> {
    if (dtos.length === 0) {
      return [];
    }

    const embeddingsToInsert = dtos.map(dto => ({
      text: dto.text,
      embedding: dto.embedding,
      researchPaperId: new Types.ObjectId(dto.researchPaperId),
    }));

    const embeddings = await ResearchPaperEmbeddingModel.insertMany(embeddingsToInsert);
    return embeddings.map(e => e.toObject());
  }

  public async existsByResearchPaperId(researchPaperId: string): Promise<boolean> {
    const count = await ResearchPaperEmbeddingModel.countDocuments({ 
      researchPaperId: new Types.ObjectId(researchPaperId) 
    }).limit(1);
    return count > 0;
  }
}

