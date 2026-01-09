import mongoose from "mongoose";
import { MongoClient } from "mongodb";
import { LoggerClient } from "./logger.client.js";
import { ConfigService } from "../config/config.service.js";

export class MongoSingleton {
  private static instance: MongoSingleton;
  private configService: ConfigService;
  private logger: LoggerClient;
  private isConnectionEstablished = false;
  private mongoClient: MongoClient | null = null;

  private constructor() {
    this.configService = new ConfigService();
    this.logger = new LoggerClient();
  }

  public static getInstance(): MongoSingleton {
    if (!MongoSingleton.instance) {
      MongoSingleton.instance = new MongoSingleton();
    }
    return MongoSingleton.instance;
  }

  public async getConnection(): Promise<typeof mongoose> {
    if (this.isConnectionEstablished && mongoose.connection.readyState === 1) {
      return mongoose;
    }

    try {
      const config = this.configService.getConfig();

      await mongoose.connect(config.mongodb.uri);
      this.isConnectionEstablished = true;
      this.logger.info("MongoDB connected successfully via Mongoose");

      // TODO: Only create one instance of the MongoClient, this is needed
      // in src/llm/endo.embeddings.model.ts
      if (!this.mongoClient) {
        this.mongoClient = new MongoClient(config.mongodb.uri);
        await this.mongoClient.connect();
        this.logger.info("MongoDB client connected successfully");
      }

      return mongoose;
    } catch (error) {
      this.logger.error("Error connecting to MongoDB:", {
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }

  public async getMongoClient(): Promise<MongoClient> {
    if (this.mongoClient && this.isConnectionEstablished) {
      return this.mongoClient;
    }

    // Ensure connection is established
    await this.getConnection();

    if (!this.mongoClient) {
      throw new Error("MongoDB client is not initialized");
    }

    return this.mongoClient;
  }

  public async disconnect(): Promise<void> {
    if (this.isConnectionEstablished) {
      await mongoose.disconnect();
      if (this.mongoClient) {
        await this.mongoClient.close();
        this.mongoClient = null;
        this.logger.info("MongoDB client disconnected");
      }
      this.isConnectionEstablished = false;
      this.logger.info("MongoDB disconnected");
    }
  }

  public isConnected(): boolean {
    return this.isConnectionEstablished && mongoose.connection.readyState === 1;
  }
}
