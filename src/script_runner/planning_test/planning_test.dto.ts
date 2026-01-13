import { CreatePlanResponse } from "../backend_client/backend_client.ts";

export interface PlanningTestDto {
    sumOfHelpfulness: number;
    plan: CreatePlanResponse['plan'];
}