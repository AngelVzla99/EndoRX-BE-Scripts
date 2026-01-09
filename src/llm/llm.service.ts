import { DynamicScrapperClient } from "../clients/dynamic.scrapper.client.js";
import { load } from "cheerio";
import { GeneratePrimitivesResponseDto, GeneratePrimitivesResponseSchema, GetDuplicatedDto, SymptomEnum } from "./llm.dto.js";
import { LoggerClient } from "../clients/logger.client.js";
import { GeneratePrimitivesSystemPrompt } from "./llm.prompt.js";
import { createAgent } from "langchain";
import { ModelProvider } from "./langchain/model.provider.js";

export class LLMService {
    private scrapper: DynamicScrapperClient;
    private logger: LoggerClient;
    private modelProvider: ModelProvider;

    constructor() {
        this.scrapper = new DynamicScrapperClient();
        this.logger = new LoggerClient();
        this.modelProvider = new ModelProvider();
    }

    private extractRelevantContent(html: string, finalUrl: string): string {
        const $ = load(html);
        
        const relevantLinks: string[] = [];
        const relevantTexts: string[] = [];
        
        $('a').each((_, element) => {
            const href = $(element).attr('href');
            const text = $(element).text().trim();
            const ariaLabel = $(element).attr('aria-label');
            
            if (href && (
                href.includes('.pdf') ||
                href.includes('download') ||
                href.includes('pdf') ||
                text.toLowerCase().includes('pdf') ||
                text.toLowerCase().includes('download') ||
                ariaLabel?.toLowerCase().includes('pdf') ||
                ariaLabel?.toLowerCase().includes('download')
            )) {
                const fullUrl = href.startsWith('http') ? href : new URL(href, finalUrl).href;
                relevantLinks.push(`Link: "${text}" | "${ariaLabel || ''}" -> ${fullUrl}`);
            }
        });
        
        $('button').each((_, element) => {
            const text = $(element).text().trim();
            const onclick = $(element).attr('onclick');
            const ariaLabel = $(element).attr('aria-label');
            
            if (text.toLowerCase().includes('pdf') || 
                text.toLowerCase().includes('download') ||
                onclick?.toLowerCase().includes('pdf') ||
                ariaLabel?.toLowerCase().includes('pdf')) {
                relevantTexts.push(`Button: "${text}" | "${ariaLabel || ''}" | onclick: ${onclick || 'none'}`);
            }
        });
        
        $('[class*="pdf"], [class*="download"], [id*="pdf"], [id*="download"]').each((_, element) => {
            const href = $(element).attr('href');
            const text = $(element).text().trim().substring(0, 100);
            const className = $(element).attr('class');
            const id = $(element).attr('id');
            
            if (href) {
                const fullUrl = href.startsWith('http') ? href : new URL(href, finalUrl).href;
                relevantLinks.push(`Element [class="${className}" id="${id}"]: "${text}" -> ${fullUrl}`);
            }
        });
        
        const metaTags: string[] = [];
        $('meta').each((_, element) => {
            const property = $(element).attr('property') || $(element).attr('name');
            const content = $(element).attr('content');
            
            if (content && property && (
                property.includes('pdf') || 
                content.includes('.pdf') ||
                property.includes('citation')
            )) {
                metaTags.push(`Meta: ${property} = ${content}`);
            }
        });
        
        let extractedContent = `Final URL: ${finalUrl}\n\n`;
        
        if (metaTags.length > 0) {
            extractedContent += `Meta Tags:\n${metaTags.join('\n')}\n\n`;
        }
        
        if (relevantLinks.length > 0) {
            extractedContent += `Relevant Links (${relevantLinks.length}):\n${relevantLinks.slice(0, 20).join('\n')}\n\n`;
        }
        
        if (relevantTexts.length > 0) {
            extractedContent += `Relevant Elements:\n${relevantTexts.slice(0, 10).join('\n')}\n`;
        }
        
        if (extractedContent.length < 200) {
            extractedContent += `\n\nNote: Very few relevant elements found. Here are all links:\n`;
            $('a').slice(0, 30).each((_, element) => {
                const href = $(element).attr('href');
                const text = $(element).text().trim().substring(0, 50);
                if (href) {
                    const fullUrl = href.startsWith('http') ? href : new URL(href, finalUrl).href;
                    extractedContent += `"${text}" -> ${fullUrl}\n`;
                }
            });
        }
        
        return extractedContent;
    }

    async getPdfUrl(doiUrl: string): Promise<string|null> {
        try {
            const scrapedPage = await this.scrapper.getPageHtml(doiUrl, 5000);
            
            const html = scrapedPage.html;
            const extractedContent = this.extractRelevantContent(html, doiUrl);          
            // find app the urls that start with https:// and end with .pdf
            const pdfUrls = extractedContent.match(/https:\/\/.*\.pdf/g);
            if (!pdfUrls) {
                this.logger.error('No PDF URLs found', { doiUrl });
                return null;
            }
            let links = pdfUrls.map(url => ({
                url: url,
                text: url.split('/').pop()?.split('?')[0],
            }));
            
            // remove duplicates and those starting with https://doi.org
            links = links.filter(link => !link.url.startsWith('https://doi.org') )
            
            const urls = links.map(link => link.url);
            const urlsSet = new Set(urls);
            const urlsArray = Array.from(urlsSet);
            

            console.log(urlsArray);

            if(urlsArray.length !== 1) {
                this.logger.warn('Multiple PDF URLs found', { doiUrl, urlsArray });
                return null;
            }

            return urlsArray[0];
        } catch (error) {
            throw new Error(`Failed to get PDF URL: ${error instanceof Error ? error.message : String(error)}`);
        }
    }

    async close(): Promise<void> {
        await this.scrapper.close();
    }

    // #region generate-primitives

    async generatePrimitives(
        topics: string[],
        numberOfPrimitives: number = 60
      ): Promise<GeneratePrimitivesResponseDto> {
        const systemPrompt = await GeneratePrimitivesSystemPrompt.format({
          topics: topics.join(', '),
          N: numberOfPrimitives,
          Symptoms: Object.values(SymptomEnum).join(', '),
        });

        const llmGeneratePrimitives = await this.modelProvider.getModel();

        const agent = createAgent({
          model: llmGeneratePrimitives,
          systemPrompt,
          tools: [],
          responseFormat: GeneratePrimitivesResponseSchema,
        });

        const result = await agent.invoke({
          messages: [
            {
              role: "user",
              content: `Generate ${numberOfPrimitives} wellness primitives for the topics: ${topics.join(', ')}.`,
            },
          ],
        });
        return result.structuredResponse;
      }
    // #endregion

    // #region get-duplicated-text

    private cosineSimilarity(vecA: number[], vecB: number[]): number {
        if (vecA.length !== vecB.length) {
            throw new Error('Vectors must have the same length');
        }
        
        let dotProduct = 0;
        let normA = 0;
        let normB = 0;
        
        for (let i = 0; i < vecA.length; i++) {
            dotProduct += vecA[i] * vecB[i];
            normA += vecA[i] * vecA[i];
            normB += vecB[i] * vecB[i];
        }
        
        const denominator = Math.sqrt(normA) * Math.sqrt(normB);
        if (denominator === 0) {
            return 0;
        }
        
        return dotProduct / denominator;
    }

    async getDuplicatedText(dto: GetDuplicatedDto[], threshold: number = 0.9): Promise<number[]> {
        if (dto.length === 0) {
            return [];
        }

        const embedder = await this.modelProvider.getEmbeddingFactory();
        
        const itemsWithEmbeddings = await Promise.all(
            dto.map(async (item) => {
                let embedding: number[];
                
                if (item.embedding) {
                    embedding = JSON.parse(item.embedding);
                } else {
                    const embeddings = await embedder.embedDocuments([item.text]);
                    embedding = embeddings[0];
                }
                
                return {
                    id: item.id,
                    text: item.text,
                    embedding,
                };
            })
        );

        const clusters: number[][] = [];
        const itemToCluster = new Map<number, number>();
        
        for (let i = 0; i < itemsWithEmbeddings.length; i++) {
            if (itemToCluster.has(i)) {
                continue;
            }
            
            const cluster = [i];
            itemToCluster.set(i, clusters.length);
            
            for (let j = i + 1; j < itemsWithEmbeddings.length; j++) {
                if (itemToCluster.has(j)) {
                    continue;
                }
                
                const similarity = this.cosineSimilarity(
                    itemsWithEmbeddings[i].embedding,
                    itemsWithEmbeddings[j].embedding
                );
                
                if (similarity >= threshold) {
                    cluster.push(j);
                    itemToCluster.set(j, clusters.length);
                }
            }
            
            if (cluster.length > 1) {
                clusters.push(cluster);
            }
        }

        const redundantIds: number[] = [];
        
        for (const cluster of clusters) {
            const representativeIndex = cluster[0];
            const redundantIndices = cluster.slice(1);
            
            for (const index of redundantIndices) {
                redundantIds.push(itemsWithEmbeddings[index].id);
            }

            // print cluster
            console.log('Cluster: ------------------------------');
            for(const index of cluster) {
                console.log(itemsWithEmbeddings[index].text);
            }
            console.log('--------------------------------');
        }
        
        return redundantIds;
    }
    // #endregion
}