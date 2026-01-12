import {
  MongoDBAtlasVectorSearch,
  type MongoDBAtlasVectorSearchLibArgs,
} from "@langchain/mongodb";
import type { Document } from "@langchain/core/documents";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { ConfigService } from "../config/config.service.js";
import { GeminiProvider } from "./gemini.provider.js";
import { Config } from "../config/config.types.js";
import { VertexAIEmbeddings } from "@langchain/google-vertexai";

export class LangchainVectorStore {
  embedder: VertexAIEmbeddings;
  dbConfig: MongoDBAtlasVectorSearchLibArgs;
  config: Config;

  constructor(dbConfig: MongoDBAtlasVectorSearchLibArgs) {
    const provider = new GeminiProvider();
    this.embedder = provider.getEmbeddingFactory();
    this.dbConfig = dbConfig;
    const configService = new ConfigService();
    this.config = configService.getConfig();
  }

  async getVectorStore() {
    const vectorStore = await new MongoDBAtlasVectorSearch(
      this.embedder,
      this.dbConfig
    );
    return vectorStore;
  }

  async search(query: string): Promise<Document[]> {
    const vectorStore = await this.getVectorStore();
    const retriever = vectorStore.asRetriever({
      verbose: true,
      k: 2,
    });
    const relevantDocs = await retriever.invoke(query);
    return relevantDocs;
  }

  async storeText(text: string, metadata: Record<string, any> = {}): Promise<void> {
    const textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
    });

    const docs = await textSplitter.createDocuments([text], [metadata]);
    
    const vectorStore = await this.getVectorStore();
    await vectorStore.addDocuments(docs);
  }
}
