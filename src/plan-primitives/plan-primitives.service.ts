import { PlanPrimitiveRepository } from "./plan-primitives.repository.ts";
import { CreatePlanPrimitiveDto } from "./plan-primitives.dto.ts";
import { mapPlanPrimitiveEntityToResponseDto, mapPrimitiveDtoToCreateDto } from "./plan-primitives.mapper.ts";
import { GeneratePrimitivesResponseDto } from "../llm/llm.dto.ts";

export class PlanPrimitiveService {
    private planPrimitiveRepository: PlanPrimitiveRepository;

    constructor() {
        this.planPrimitiveRepository = new PlanPrimitiveRepository();
    }

    async createInBulk(llmResponse: GeneratePrimitivesResponseDto){
        const createDtos: CreatePlanPrimitiveDto[] = llmResponse.primitives.map(primitive =>
            mapPrimitiveDtoToCreateDto(primitive)
        );

        const entities = await this.planPrimitiveRepository.createPlanPrimitivesInBulk(createDtos);
        
        return entities.map(entity => mapPlanPrimitiveEntityToResponseDto(entity));
    }
}

