import { LoggerClient } from "../../clients/logger.client";
import { BackendClient } from "../backend_client/backend_client";
import { EXTRACTOR_TEST_MESSAGES } from "./extractor_test.constants";

export class ExtractorTest {

    private backendClient: BackendClient;
    private logger: LoggerClient;

    constructor() {
        this.backendClient = new BackendClient();
        this.logger = new LoggerClient();
    }

    private async emptyProfile() {
        // Get patient profile
        const {patient} = await this.backendClient.getPatientProfile();
        console.log(JSON.stringify(patient, null, 2));

        this.logger.info("Checking | Patient profile with id: " + patient.id);

        await this.backendClient.updatePatientProfile({
            medicalSummary: null,
            symptomsOfInterest: [],
            dietType: [],
            dietaryRestrictions: null,
            contraindicationTags: [],
            medicalCondition: null,
            physicalCondition: null,
            lifelongMedications: null,
            lifestyleHealth: null,
            reproductiveHealth: null,
            surgeries: null,
            allergies: null,
        });
    }

    private async startAIConversation() {
        for (const testCase of EXTRACTOR_TEST_MESSAGES) {
            this.logger.info("Starting test case | " + testCase.title);
            for (const message of testCase.messages) {
                await this.backendClient.postPatientChatMessage({ message });
                // delay
                await new Promise(resolve => setTimeout(resolve, 5500));
            }
        }
    }

    private async checkProfileData() {
        const {patient} = await this.backendClient.getPatientProfile();

        console.log(JSON.stringify(patient, null, 2));
        console.log("--------------------------------");
        let fullText = "";
        let keywords = [];
        for(const testCase of EXTRACTOR_TEST_MESSAGES) {
            this.logger.info("Validating test case | " + testCase.title);

            keywords.push(...testCase.keyWords);

            const fieldValue = patient[testCase.field];
            if(typeof fieldValue === 'string' || Array.isArray(fieldValue)) {
                let missingKeywords = [];
                for(const keyword of testCase.keyWords) {
                    if(!fieldValue.includes(keyword)) {
                        missingKeywords.push(keyword);
                    }
                }
                if(missingKeywords.length > 0) {
                    this.logger.error("Test case | " + testCase.title + " is not valid. Missing keywords: " + missingKeywords.join(', '));
                }

                fullText += fieldValue;

            }else{
                this.logger.error("This field is not a string or an array: " + testCase.field);
            }
        }

        // count the number of keywords in the full text
        let countKeywords = 0;
        for(const keyword of keywords) {
            if(fullText.includes(keyword)) {
                countKeywords++;
            }
        }

        this.logger.info("Summary of the extraction of the information from the profile")
        this.logger.info("Percentage of valid keywords: " + (countKeywords / keywords.length) * 100 + "%");
    }

    async testExtractor() {
        const history = await this.backendClient.getChatMessageHistory();
        if (history.messages && history.messages.length > 0) {
            throw new Error("Chat history is not empty. Expected empty history before starting test.");
        }
        await this.emptyProfile();
        await this.startAIConversation();
        await this.checkProfileData();
    }
}