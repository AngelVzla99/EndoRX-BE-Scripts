import dotenv from "dotenv";
import type { Config } from "./config.types.js";

// In production (Cloud Run), secrets are mounted to /secrets/.env
// In development, .env is in the root directory
const pathDotEnv = process.env.DOT_ENV_PATH ?? ".env";
dotenv.config({ path: pathDotEnv, quiet: true });

export class ConfigService {
  getConfig(): Config {

    const mongodbUri = process.env.MONGODB_URI;
    if (!mongodbUri) {
      throw new Error("MONGODB_URI is not set");
    }

    return {      
      mongodb: {
        uri: mongodbUri,
      },
      logger: this.getLoggerConfig(),
      commure: this.getCommureConfig(),
      backend: this.getBackendConfig(),
      llm: this.getLLMConfig(),
      auth0: this.getAuth0Config(),
    };
  }

  private getLoggerConfig(): Config["logger"] {
    return {
      level: process.env.LOG_LEVEL || "info",
      activateLogColor: process.env.ACTIVATE_LOG_COLOR === "true",
      logRequests: process.env.LOG_REQUEST === "true",
    };
  }

  private getCommureConfig(): Config["commure"] {
    const commureUrl = process.env.COMMURE_URL;
    if (!commureUrl) {
      throw new Error("COMMURE_URL is not set");
    }

    const commureAuthToken = process.env.COMMURE_AUTH_TOKEN;
    if (!commureAuthToken) {
      throw new Error("COMMURE_AUTH_TOKEN is not set");
    }

    return {
      url: commureUrl.trim(),
      authToken: commureAuthToken.trim(),
    };
  }

  private getBackendConfig(): Config["backend"] {
    const backendUrl = process.env.BACKEND_URL ?? "http://localhost:3000/api";
    
    const backendToken = process.env.BACKEND_TOKEN;
    if (!backendToken) {
      throw new Error("BACKEND_TOKEN is not set");
    }
    
    return {
      url: backendUrl.trim(),
      token: backendToken.trim(),
    };
  }

  private getLLMConfig(): Config["llm"] {
    const ragVerbose = process.env.LLM_RAG_VERBOSE !== "false";
    const ragkElements = process.env.LLM_RAG_K_ELEMENTS 
      ? parseInt(process.env.LLM_RAG_K_ELEMENTS, 10)
      : 5;

    return {
      ragVerbose,
      ragkElements,
    };
  }

  private getAuth0Config(): Config["auth0"] {
    const issuerBaseUrl = process.env.AUTH0_ISSUER_BASE_URL;
    if (!issuerBaseUrl) {
      throw new Error("AUTH0_ISSUER_BASE_URL is not set");
    }

    const audience = process.env.AUTH0_AUDIENCE;
    if (!audience) {
      throw new Error("AUTH0_AUDIENCE is not set");
    }

    const tokenSigningAlg = process.env.AUTH0_TOKEN_SIGNING_ALG;
    if (!tokenSigningAlg) {
      throw new Error("AUTH0_TOKEN_SIGNING_ALG is not set");
    }

    const clientId = process.env.AUTH0_CLIENT_ID;
    if (!clientId) {
      throw new Error("AUTH0_CLIENT_ID is not set");
    }

    const clientSecret = process.env.AUTH0_CLIENT_SECRET;
    if (!clientSecret) {
      throw new Error("AUTH0_CLIENT_SECRET is not set");
    }

    return {
      issuerBaseUrl: issuerBaseUrl.trim(),
      audience: audience.trim(),
      tokenSigningAlg: tokenSigningAlg.trim(),
      clientId: clientId.trim(),
      clientSecret: clientSecret.trim(),
    };
  }
}
