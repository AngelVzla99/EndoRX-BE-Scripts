import { BackendClient, CreatePlanResponse, PatientProfileDto, PlanItem, PlanItemFeedback, UpdatePatientProfileDto } from "../backend_client/backend_client";
import { LoggerClient } from "../../clients/logger.client";
import seedrandom from 'seedrandom';
import { PlanningTestDto } from "./planning_test.dto";

export enum PlanningTestCategory {
    GOOD = "good",
    MEDIUM_GOOD = "medium_good",
    MEDIUM = "medium",
    MEDIUM_BAD = "medium_bad",
    BAD = "bad",
}

export class PlanningTestService {
    private backendClient: BackendClient;
    private logger: LoggerClient;
    private mapItemToCategory: Record<string, string|null> = {}

    constructor() {
        this.backendClient = new BackendClient();
        this.logger = new LoggerClient();

        // static seed for reproducibility
        seedrandom("planning_test_seed", { global: true });
        this.logger.info("Seed set for reproducibility");
    }

    private getRandomCategory() {
        const categories = [PlanningTestCategory.GOOD, PlanningTestCategory.MEDIUM_GOOD, PlanningTestCategory.MEDIUM, PlanningTestCategory.MEDIUM_BAD, PlanningTestCategory.BAD];
        return categories[Math.floor(Math.random() * categories.length)];
    }

    private getHelpfulnessByCategory(category: string) {
        switch(category) {
            case PlanningTestCategory.GOOD:
                return 5;
            case PlanningTestCategory.MEDIUM_GOOD:
                return 4;
            case PlanningTestCategory.MEDIUM:
                return 3;
            case PlanningTestCategory.MEDIUM_BAD:
                return 2;
            case PlanningTestCategory.BAD:
                return 1;
        }
        return 0;
    }

    private async getFeedbackToPlanItem(planItem: PlanItem) {
        let category = this.mapItemToCategory[planItem.primitiveId];
        if(!category) {
            category = this.getRandomCategory();
            this.mapItemToCategory[planItem.primitiveId] = category;
        }

        return {
            helpfulness: this.getHelpfulnessByCategory(category),
            adherence: 1,
            notes: null,
        }
    }

    private async createAndProcessPlan() : Promise<PlanningTestDto> {
        this.logger.info("Creating plan in backend");
        const planResponse = await this.backendClient.createPlan();
        this.logger.info("Plan created", { planId: planResponse.plan.id });

        let index = 0;
        const feedbacks: PlanItemFeedback[] = [];
        for (const item of planResponse.plan.planItems) {
            const feedback = await this.getFeedbackToPlanItem(item);   
            this.logger.info("Submitting feedback to plan item", { planId: planResponse.plan.id, itemId: item.id, feedback: feedback });
            await this.backendClient.submitPlanItemFeedback(planResponse.plan.id, item.id, feedback);
            this.logger.info("Feedback submitted to plan item", { planId: planResponse.plan.id, itemId: item.id, feedback: feedback });
            feedbacks.push(feedback);
            // update feedback response
            planResponse.plan.planItems[index].feedback = feedback;
            index++;
        }

        const sumOfHelpfulness = feedbacks.reduce((acc, feedback) => acc + (feedback.helpfulness || 0), 0);
        return {
            sumOfHelpfulness: sumOfHelpfulness,
            plan: planResponse.plan,
        }
    }

    private async printPlansQuality( plans: PlanningTestDto[] ) {
        let totalSumOfHelpfulness = 0;
        const existingPrimitiveIds : string[] = [];
        for(const plan of plans) {
            console.log('==== Plan '+plan.plan.id+' Quality ====');
            for(const item of plan.plan.planItems) {
                const tags : string[] = []
                let isNew = false;
                if(!existingPrimitiveIds.includes(item.primitiveId)) {
                    isNew = true;
                    tags.push('[NEW]');
                    existingPrimitiveIds.push(item.primitiveId);
                }
                const category = this.mapItemToCategory[item.primitiveId];
                if(category) {
                    tags.push('['+category.toUpperCase()+']');
                }
                console.log('Tag: '+tags.join(' ')+' Primitive ID: '+item.primitiveId+' Feedback: '+item.feedback?.helpfulness, ' | Description: '+item.descriptionClinical);
                if(!isNew && (category === 'bad' || category === 'medium_bad')) {
                    this.logger.error('Already bad item: '+item.primitiveId);
                }
            }
            totalSumOfHelpfulness += plan.sumOfHelpfulness;
            console.log('Sum of helpfulness: '+plan.sumOfHelpfulness);
            console.log('Cummulative sum of helpfulness: '+totalSumOfHelpfulness);

        }
        console.log('Total sum of helpfulness: '+totalSumOfHelpfulness);
    }

    async testPlanQuality() {
        const patientProfile = await this.backendClient.getPatientProfile();
        const existingPlan = await this.backendClient.getPatientPlan().catch(() => null);
        
        if (existingPlan) {
            throw new Error(`There is an existing plan for the user. Please remove all plans for the user (patient ID: '${patientProfile.patient.id}') before running this test.`);
        }

        const patientPayload: UpdatePatientProfileDto = {
            dateOfBirth: "1990-01-01",
            bodyMassIndex: 22.5,
            location: "New York, USA",
            goals: ["reduce_pain", 'improve_energy'],
            symptomsOfInterest: ["painful_periods", 'pelvic_pain', 'back_pain'],
            dietType: ["vegan"],
            dietaryRestrictions: "No gluten, avoiding dairy products",
            hasGymAccess: true,
            budgetLevel: "medium",
            dayInCycle: 14,
            cyclePhase: "ovulatory_phase",
        };

        this.logger.info("Updating patient profile in backend");
        await this.backendClient.updatePatientProfile(patientPayload);
        this.logger.info("Patient profile updated");

        const plans: PlanningTestDto[] = [];
        for(let i = 0; i < 5; i++) {
            const result = await this.createAndProcessPlan();
            console.log(JSON.stringify(result.sumOfHelpfulness, null, 2));
            plans.push(result);
        }
        await this.printPlansQuality(plans);
    }
}
