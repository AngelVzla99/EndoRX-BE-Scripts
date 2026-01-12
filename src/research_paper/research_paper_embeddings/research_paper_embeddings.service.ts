import mongoose from "mongoose";
import { Collection, Document } from "mongodb";
import { MongoDBAtlasVectorSearchLibArgs } from "@langchain/mongodb";
import { MongoSingleton } from "../../clients/mongo.client.js";
import { CreateResearchPaperEmbeddingDto } from "./research_paper_embeddings.dto.js";
import { ResearchPaperEmbeddingsRepository } from "./research_paper_embeddings.repository.js";
import { ResearchPaperEmbeddingEntity } from "./research_paper_embeddings.model.js";

const collectionName = "research_paper_embeddings";

export class ResearchPaperEmbeddingsService {
  private repository: ResearchPaperEmbeddingsRepository;

  constructor() {
    this.repository = new ResearchPaperEmbeddingsRepository();
  }

  public async create(dto: CreateResearchPaperEmbeddingDto): Promise<ResearchPaperEmbeddingEntity> {
    return await this.repository.create(dto);
  }

  public async createInBatch(dtos: CreateResearchPaperEmbeddingDto[]): Promise<ResearchPaperEmbeddingEntity[]> {
    return await this.repository.createInBatch(dtos);
  }

  public async existsByResearchPaperId(researchPaperId: string): Promise<boolean> {
    return await this.repository.existsByResearchPaperId(researchPaperId);
  }
}

async function getResearchPaperEmbeddingsCollection(): Promise<Collection<Document>> {
  const mongoClient = await MongoSingleton.getInstance().getMongoClient();
  const dbName = mongoose.connection.db?.databaseName;

  if (!dbName) {
    throw new Error("Database name not found in mongoose connection");
  }

  const db = mongoClient.db(dbName);
  return db.collection(collectionName);
}

export async function getDbConfigForResearchPaperVectorSearch(): Promise<MongoDBAtlasVectorSearchLibArgs> {
  return {
    collection: await getResearchPaperEmbeddingsCollection(),
    indexName: "vector_index",
    textKey: "text",
    embeddingKey: "embedding",
  };
}

