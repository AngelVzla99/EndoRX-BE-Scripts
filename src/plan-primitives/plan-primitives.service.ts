import { PlanPrimitiveRepository } from "./plan-primitives.repository.js";
import { CreatePlanPrimitiveDto } from "./plan-primitives.dto.js";
import { mapPlanPrimitiveEntityToResponseDto, mapPrimitiveDtoToCreateDto } from "./plan-primitives.mapper.js";
import { GeneratePrimitivesResponseDto } from "../llm/llm.dto.js";

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

