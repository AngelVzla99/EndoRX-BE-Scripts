import { ChatVertexAI, VertexAIEmbeddings } from "@langchain/google-vertexai";

export class GeminiProvider {
  private llm: ChatVertexAI;

  constructor() {
    this.llm = new ChatVertexAI({
      model: 'gemini-2.0-flash',
      temperature: 0,
      maxRetries: 2,
    });
  }

  getModel() {
    return this.llm;
  }

  getEmbeddingFactory() {
    return new VertexAIEmbeddings({
      model: 'text-embedding-005',
    });
  }
}
