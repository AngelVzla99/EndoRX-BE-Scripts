import { BaseChatModel } from "@langchain/core/language_models/chat_models";
import { ConfigService } from "../../config/config.service";
import { ChatVertexAI, VertexAIEmbeddings } from "@langchain/google-vertexai";
import { Embeddings } from "@langchain/core/embeddings";

export class ModelProvider {
  private configService: ConfigService;

  constructor() {
    this.configService = new ConfigService();
  }

  async getModel(): Promise<BaseChatModel> {
    const config = await this.configService.getConfig();
    return new ChatVertexAI({
      model: 'gemini-2.5-pro',
      temperature: 0,
      maxRetries: 2,
    });
  }

  async getEmbeddingFactory(): Promise<Embeddings> {
    return new VertexAIEmbeddings({
        model: 'text-embedding-005',
    });
  }
}