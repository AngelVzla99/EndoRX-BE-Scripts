import { BackendClient } from "./backend_client/backend_client.js";
import { LoggerClient } from "../clients/logger.client.js";
import { LLMService } from "../llm/llm.service.js";
import { PlanPrimitiveService } from "../plan-primitives/plan-primitives.service.js";
import { GetDuplicatedDto, PrimitiveDto } from "../llm/llm.dto.js";
import { Auth0Client } from "../auth0/auth0.client.js";
import { PlanningTestService } from "./planning_test/planning_test.service.js";
import { ExtractorTest } from "./extractor_test/extractor_test.js";

export class ScriptRunnerService {
    private backendClient: BackendClient;
    private logger: LoggerClient;
    private llmService: LLMService;
    private planPrimitiveService: PlanPrimitiveService;
    private planTestService: PlanningTestService
    private extractorTest: ExtractorTest;

    constructor() {
        this.backendClient = new BackendClient();
        this.logger = new LoggerClient();
        this.llmService = new LLMService();
        this.planPrimitiveService = new PlanPrimitiveService();
        this.planTestService = new PlanningTestService();
        this.extractorTest = new ExtractorTest();
    }

    /**
     * Scrpit to measure the response time of the endpoint POST /chat-message
     */
    async responseTimeStatistics(){
        // config
        const messagesToSend = [
            "Hi, how can you help me?",
            "What infomration do you know about me?",
            "What do you know about endometriosis?",
            "What do you know about the treatment of endometriosis?",
            "What do you know about the prevention of endometriosis?",
            "What do you know about the causes of endometriosis?",
            "What do you know about the symptoms of endometriosis?",
            "what is the relation between endometriosis and stress?",
        ]

        // Pre-condition: The history of the chat is empty
        const {messages:chatHistory} = await this.backendClient.getChatMessageHistory();
        if(chatHistory && chatHistory.length > 0){
            this.logger.error("The history of the chat is not empty, cannot calculate statistics");
            return;
        }

        // Run the script
        const responseTimes : number[] = [];
        for(const message of messagesToSend){
            const start = Date.now();
            const response = await this.backendClient.postChatMessage({message});
            this.logger.info(`Response:`, {message: response.message});
            const end = Date.now();
            const responseTime = end - start;
            responseTimes.push(responseTime);
        }


        // Calculate the statistics
        const averageResponseTime = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
        const minResponseTime = Math.min(...responseTimes);
        const maxResponseTime = Math.max(...responseTimes);
        const medianResponseTime = responseTimes[Math.floor(responseTimes.length / 2)];
        this.logger.info(`Response time statistics:`, {
            averageResponseTime,
            minResponseTime,
            maxResponseTime,
            medianResponseTime,
        });
    }

    countPrimitivesByDomain(primitives: PrimitiveDto[]){
        const result: Record<string, number> = {};
        const primitivesByDomain = primitives.reduce((acc, primitive) => {
            acc[primitive.domain] = (acc[primitive.domain] || 0) + 1;
            return acc;
        }, result);
        return primitivesByDomain;
    }

    async generatePrimitives(){
        // TODO: Use RAG

        // this code will generate primitives and contraindicationTags
        const topics = [
            'comfort',
            'lifestyle',
            'nutrition',
            'supplement',
            'sleep',
            'stress',
            'exercise',
            'pelvic-floor-health',
            'menstrual-health',
        ]

        this.logger.info("Generating primitives", {topics: topics.join(', ')});
        let primitives : PrimitiveDto[] = []
        for(const topic of topics){
            const {primitives: topicPrimitives} = await this.llmService.generatePrimitives([topic], 20);
            primitives.push(...topicPrimitives);
            this.logger.info("Primitives generated for topic", {topic: topic, primitives: topicPrimitives.length});
        }

        this.logger.info("Removing duplicated primitives");
        const removeDuplicatesDto : GetDuplicatedDto[] = primitives.map((primitive, index) => ({
            id: index,
            text: primitive.shortDescription,
        }));
        const duplicatedIds = await this.llmService.getDuplicatedText(removeDuplicatesDto);
        primitives = primitives.filter((primitive, index) => !duplicatedIds.includes(index));

        // log the primitives
        // console.log(JSON.stringify(primitives, null, 2));
        this.logger.info("Primitives generated", {primitives: primitives.length});
        const primitivesByDomain = this.countPrimitivesByDomain(primitives);
        this.logger.info("Primitives by domain", {primitivesByDomain});

        const createdPrimitives = await this.planPrimitiveService.createInBulk({primitives});
        this.logger.info("Primitives created", {createdPrimitives: createdPrimitives.length});
    }

    async testPlanQuality() {
        await this.planTestService.testPlanQuality();
    }

    async testExtractor() {
        await this.extractorTest.testExtractor();
    }
}