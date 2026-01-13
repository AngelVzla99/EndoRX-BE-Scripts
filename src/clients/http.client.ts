import axios, { AxiosInstance, AxiosResponse } from "axios";
import { LoggerClient } from "./logger.client.ts";

export enum HttpClientType {
  SEMANTIC_SCHOLAR = "SEMANTIC_SCHOLAR",
  PUBMED = "PUBMED",
  COMMURE = "COMMURE",
  DOI = "DOI",
  BACKEND = "BACKEND",
  AUTH0 = "AUTH0",
}

export class HttpClient {
  private axiosInstance: AxiosInstance;
  private logger: LoggerClient;
  private clientType: HttpClientType;

  constructor(clientType: HttpClientType) {
    this.clientType = clientType;
    this.logger = new LoggerClient();
    
    this.axiosInstance = axios.create({
      timeout: 600000,
      headers: {
        "Content-Type": "application/json",
      },
      maxRedirects: 10,
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    // Request interceptor
    this.axiosInstance.interceptors.request.use(
      (config) => {
        this.logger.info(`[${this.clientType}] Making ${config.method?.toUpperCase()} request`, {
          url: config.url,
          method: config.method,
        });
        return config;
      },
      (error) => {
        this.logger.error(`[${this.clientType}] Request error:`, {
          error: error instanceof Error ? error.message : String(error),
        });
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.axiosInstance.interceptors.response.use(
      (response) => {
        const finalUrl = response.request?.res?.responseUrl || response.config.url;
        this.logger.info(`[${this.clientType}] Request successful`, {
          url: response.config.url,
          finalUrl: finalUrl,
          status: response.status,
          redirected: finalUrl !== response.config.url,
        });
        return response;
      },
      (error) => {
        this.logger.error(`[${this.clientType}] Response error:`, {
          url: error.config?.url,
          status: error.response?.status,
          error: error instanceof Error ? error.message : String(error),
        });
        return Promise.reject(error);
      }
    );
  }

  public async get<R = any>(
    url: string,
    headers?: Record<string, string>
  ): Promise<AxiosResponse<R>> {
    try {
      const response = await this.axiosInstance.get<R>(url, {
        headers: {
          ...this.axiosInstance.defaults.headers.common,
          ...headers,
        },
      });
      return response;
    } catch (error) {
      this.logger.error(`[${this.clientType}] GET request failed:`, {
        url,
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }

  public async post<T = any, R = any>(
    url: string,
    body: T,
    headers?: Record<string, string>
  ): Promise<AxiosResponse<R>> {
    try {
      const response = await this.axiosInstance.post<R>(url, body, {
        headers: {
          ...this.axiosInstance.defaults.headers.common,
          ...headers,
        },
      });
      return response;
    } catch (error) {
      this.logger.error(`[${this.clientType}] POST request failed:`, {
        url,
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }

  public async put<T = any, R = any>(
    url: string,
    body: T,
    headers?: Record<string, string>
  ): Promise<AxiosResponse<R>> {
    try {
      const response = await this.axiosInstance.put<R>(url, body, {
        headers: {
          ...this.axiosInstance.defaults.headers.common,
          ...headers,
        },
      });
      return response;
    } catch (error) {
      this.logger.error(`[${this.clientType}] PUT request failed:`, {
        url,
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }

  public getClientType(): HttpClientType {
    return this.clientType;
  }
}

