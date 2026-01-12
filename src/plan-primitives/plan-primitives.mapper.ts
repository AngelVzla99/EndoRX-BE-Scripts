import { PlanPrimitiveEntity } from "./plan-primitives.model.js";
import { CreatePlanPrimitiveDto, CreatePlanPrimitiveSchema, PlanPrimitiveDto } from "./plan-primitives.dto.js";
import { PrimitiveDto } from "../llm/llm.dto.js";

export function mapPlanPrimitiveEntityToResponseDto(
    entity: PlanPrimitiveEntity
): PlanPrimitiveDto {
    return {
        id: entity._id.toString(),
        shortDescription: entity.shortDescription,
        domain: entity.domain,
        clinicalDescription: entity.clinicalDescription,
        frequencyPerWeek: entity.frequencyPerWeek,
        timeBurdenMinutesPerDay: entity.timeBurdenMinutesPerDay,
        mechanismTags: entity.mechanismTags,
        repetitionDays: entity.repetitionDays,
        relevantSymptoms: entity.relevantSymptoms?.map(symptom => ({
            type: symptom.type,
            relevance: symptom.relevance,
        })),
        contraindicationTags: entity.contraindicationTags,
        createdAt: entity.createdAt,
        updatedAt: entity.updatedAt,
    };
}

export function mapPrimitiveDtoToCreateDto(primitive: PrimitiveDto): CreatePlanPrimitiveDto {
    return CreatePlanPrimitiveSchema.parse({
        shortDescription: primitive.shortDescription,
        domain: primitive.domain,
        clinicalDescription: primitive.clinicalDescription,
        frequencyPerWeek: primitive.frequencyPerWeek,
        repetitionDays: primitive.repetitionDays,
        timeBurdenMinutesPerDay: primitive.timeBurdenMinutesPerDay,
        mechanismTags: primitive.mechanismTags,
        relevantSymptoms: primitive.relevantSymptoms?.map(symptom => ({
            type: symptom.type,
            relevance: symptom.relevance,
        })),
        contraindicationTags: primitive.contraindicationTags,
    });
}

