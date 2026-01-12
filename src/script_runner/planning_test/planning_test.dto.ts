import { CreatePlanResponse } from "../backend_client/backend_client.js";

export interface PlanningTestDto {
    sumOfHelpfulness: number;
    plan: CreatePlanResponse['plan'];
}