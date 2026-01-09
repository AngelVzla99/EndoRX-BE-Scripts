import {
  MongoDBAtlasVectorSearch,
  type MongoDBAtlasVectorSearchLibArgs,
} from "@langchain/mongodb";
import type { Document } from "@langchain/core/documents";
import { ConfigService } from "../../config/config.service";
import { ModelProvider } from "./model.provider";

export class LangchainVectorStore {
  private dbConfig: MongoDBAtlasVectorSearchLibArgs;
  private configService: ConfigService;
  private modelProvider: ModelProvider;

  constructor(dbConfig: MongoDBAtlasVectorSearchLibArgs) {
    // configuration
    this.dbConfig = dbConfig;
    this.configService = new ConfigService();
    this.modelProvider = new ModelProvider();
  }

  async getVectorStore(): Promise<MongoDBAtlasVectorSearch> {
    const embedder = await this.modelProvider.getEmbeddingFactory();
    return new MongoDBAtlasVectorSearch(embedder, this.dbConfig);
  }

  async search(query: string): Promise<Document[]> {
    const vectorStore = await this.getVectorStore();
    const config = this.configService.getConfig();
    const retriever = vectorStore.asRetriever({
      verbose: config.llm.ragVerbose,
      k: config.llm.ragkElements,
    });
    const relevantDocs = await retriever.invoke(query);
    return relevantDocs;
  }
}
