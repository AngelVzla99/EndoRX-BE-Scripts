import { PlanPrimitiveModel, PlanPrimitiveEntity } from "./plan-primitives.model.ts";
import { CreatePlanPrimitiveDto } from "./plan-primitives.dto.ts";

export class PlanPrimitiveRepository {
    async createPlanPrimitivesInBulk(dtoList: CreatePlanPrimitiveDto[]): Promise<PlanPrimitiveEntity[]> {
        const planPrimitives = dtoList.map(dto => ({
            shortDescription: dto.shortDescription,
            domain: dto.domain,
            clinicalDescription: dto.clinicalDescription,
            frequencyPerWeek: dto.frequencyPerWeek,
            timeBurdenMinutesPerDay: dto.timeBurdenMinutesPerDay,
            mechanismTags: dto.mechanismTags,
            relevantSymptoms: dto.relevantSymptoms,
            contraindicationTags: dto.contraindicationTags,
        }));

        const savedPlanPrimitives = await PlanPrimitiveModel.insertMany(planPrimitives);
        return savedPlanPrimitives.map(primitive => primitive.toObject());
    }
}

