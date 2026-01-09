import { HttpClient, HttpClientType } from "../../clients/http.client.js";
import { ConfigService } from "../../config/config.service.js";
import { z } from "zod";

interface PostChatMessagePayload {
    message: string;
    [key: string]: any;
}

interface ChatMessageResponse {
    id: string;
    message: string;
    role: string;
}

interface ChatHistoryResponse {
    messages: ChatMessageResponse[];
    [key: string]: any;
}

interface ResponsePostChatMessage {
    id: string;
    message: string;
}

interface CreatePatientPayload {
    age: number;
    bodyMassIndex: number;
    location: string;
    goals: string[];
    symptomsOfInterest: string[];
    dietType: string[];
    dietaryRestrictions: string;
    hasGymAccess: boolean;
    budgetLevel: string;
    dayInCycle: number;
    cyclePhase: string;
}

interface CreatePatientResponse {
    id: string;
    [key: string]: any;
}

interface UpdatePatientProfileResponse {
    [key: string]: any;
}

export const PatientProfileSchema = z.object({
    id: z.string(),
    dateOfBirth: z.string().nullish(),
    estimatedDateOfBirth: z.string().nullish(),
    bodyMassIndex: z.number().min(0.0001).nullish(),
    location: z.string().nullish(),
    goals: z.array(z.string()).nullish(),
    symptomsOfInterest: z.array(z.string()).nullish(),
    dietType: z.array(z.string()).nullish(),
    dietaryRestrictions: z.string().nullish(),
    hasGymAccess: z.boolean().nullish(),
    budgetLevel: z.string().nullish(),
    dayInCycle: z.number().int().min(1).nullish(),
    cyclePhase: z.string().nullish(),
    contraindicationTags: z.array(z.string()).nullish(),
    primitivesDeactivated: z.array(z.string()).nullish(),
    medicalCondition: z.string().nullish(),
    physicalCondition: z.string().nullish(),
    lifelongMedications: z.string().nullish(),
    dietaryRestriction: z.string().nullish(),
    lifestyleHealth: z.string().nullish(),
    reproductiveHealth: z.string().nullish(),
    surgeries: z.string().nullish(),
    allergies: z.string().nullish(),
    medicalSummary: z.string().nullish(),
    updatedAt: z.date(),
    createdAt: z.date(),
  });
  
export type PatientProfileDto = z.infer<typeof PatientProfileSchema>;

export type UpdatePatientProfileDto = Partial<PatientProfileDto>;

interface GetPatientProfileResponse {
    patient : PatientProfileDto
}

interface GetPatientPlanResponse {
    id: string;
    [key: string]: any;
}

export interface PlanItemFeedback {
    helpfulness: number | null;
    adherence: number | null;
    notes: string | null;
}

export interface PlanItem {
    id: string;
    descriptionClinical: string;
    primitiveId: string;
    feedback: PlanItemFeedback;
}

export interface CreatePlanResponse {
    message: string;
    plan: {
        id: string;
        patientId: string;
        summary: string;
        planItems: PlanItem[];
        createdAt: string;
        updatedAt: string;
    };
}

export class BackendClient {
    private httpClient: HttpClient;
    private baseUrl: string;
    private backendToken: string;

    constructor() {
        this.httpClient = new HttpClient(HttpClientType.BACKEND);
        const configService = new ConfigService();
        const config = configService.getConfig();
        this.baseUrl = config.backend.url;
        this.backendToken = config.backend.token;
    }

    public async postChatMessage(payload: PostChatMessagePayload): Promise<ResponsePostChatMessage> {
        const url = `${this.baseUrl}/chat-message`;
        const headers = {
            'Authorization': `Bearer ${this.backendToken}`
        };
        const response = await this.httpClient.post<PostChatMessagePayload, ResponsePostChatMessage>(url, payload, headers);
        return response.data;
    }

    public async postPatientChatMessage(payload: PostChatMessagePayload): Promise<ResponsePostChatMessage> {
        const url = `${this.baseUrl}/patient/chat-message`;
        const headers = {
            'Authorization': `Bearer ${this.backendToken}`
        };
        const response = await this.httpClient.post<PostChatMessagePayload, ResponsePostChatMessage>(url, payload, headers);
        return response.data;
    }

    public async getChatMessageHistory(): Promise<ChatHistoryResponse> {
        const url = `${this.baseUrl}/chat-message/history`;
        const headers = {
            'Authorization': `Bearer ${this.backendToken}`
        };
        const response = await this.httpClient.get<ChatHistoryResponse>(url, headers);
        return response.data;
    }

    public async createPatient(payload: CreatePatientPayload): Promise<CreatePatientResponse> {
        const url = `${this.baseUrl}/patient`;
        const headers = {
            'Authorization': `Bearer ${this.backendToken}`
        };
        const response = await this.httpClient.post<CreatePatientPayload, CreatePatientResponse>(url, payload, headers);
        return response.data;
    }

    public async createPlan(): Promise<CreatePlanResponse> {
        const url = `${this.baseUrl}/plan`;
        const headers = {
            'Authorization': `Bearer ${this.backendToken}`
        };
        const response = await this.httpClient.post<{}, CreatePlanResponse>(url, {}, headers);
        return response.data;
    }

    public async updatePatientProfile(payload: UpdatePatientProfileDto): Promise<UpdatePatientProfileResponse> {
        const url = `${this.baseUrl}/patient/profile`;
        const headers = {
            'Authorization': `Bearer ${this.backendToken}`
        };
        const response = await this.httpClient.put<UpdatePatientProfileDto, UpdatePatientProfileResponse>(url, payload, headers);
        return response.data;
    }

    public async submitPlanItemFeedback(planId: string, planItemId: string, feedback: PlanItemFeedback): Promise<void> {
        const url = `${this.baseUrl}/plan/${planId}/plan-item/${planItemId}/feedback`;
        const headers = {
            'Authorization': `Bearer ${this.backendToken}`
        };
        await this.httpClient.put<PlanItemFeedback, void>(url, feedback, headers);
    }

    public async getPatientProfile(): Promise<GetPatientProfileResponse> {
        const url = `${this.baseUrl}/patient/profile`;
        const headers = {
            'Authorization': `Bearer ${this.backendToken}`
        };
        const response = await this.httpClient.get<GetPatientProfileResponse>(url, headers);
        return response.data;
    }

    public async getPatientPlan(): Promise<GetPatientPlanResponse | null> {
        const url = `${this.baseUrl}/patient/plan`;
        const headers = {
            'Authorization': `Bearer ${this.backendToken}`
        };
        try {
            const response = await this.httpClient.get<GetPatientPlanResponse>(url, headers);
            return response.data;
        } catch (error: any) {
            if (error.response?.status === 404) {
                return null;
            }
            throw error;
        }
    }
}
