import { CreatePlanResponse } from "../backend_client/backend_client";

export interface PlanningTestDto {
    sumOfHelpfulness: number;
    plan: CreatePlanResponse['plan'];
}